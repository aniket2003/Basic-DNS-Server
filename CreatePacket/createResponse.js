const { createDNSHeader } = require("../Dns-Sections/Header");
const { createQuestion } = require("../Dns-Sections/Question");
const { createAnswer } = require("../Dns-Sections/Answer");

const iptoHexBytes = (ip) =>{
    const octets = ip.split('.');
    return Buffer.from(octets.map(octet=>parseInt(octet, 10)));
}

const createResponse = (decodedResponse, rinfo) => {
  const Headerdata = {
    id: decodedResponse.id,
    qr: 1 << 15, // This indicates a response
    opcode: 0,
    aa: 0,
    tc: 0,
    rd: decodedResponse.flag_rd ? 1 : 0,
    ra: 0,
    z: 0,
    rcode: decodedResponse.rcode, // NOERROR
    qdcount: 1, // There's always one question
    ancount: decodedResponse.answers.length, // Assume there's one answer from the DNS server
    nscount: 0,
    arcount: 0,
  };

  const header = createDNSHeader(Headerdata);
  const question = createQuestion({
    questions: [
      {
        qname: decodedResponse.questions[0].name,
        // qtype: decodedResponse.questions[0].type === 'A' ? 1 : 0 ,
        // qclass: decodedResponse.questions[0].class === 'IN' ? 1 : 0,
        qtype: 1,
        qclass: 1,
      },
    ],
  });

  const answerArray = [];
  let resolvedName='';

  for(const answer of decodedResponse.answers){
    if (answer.type === 'CNAME') {
        resolvedName = answer.data;
    } else if (answer.type === 'A') {
        answerArray.push({
            aname: resolvedName || answer.name,
            // aclass: answer.class === 'A' ? 1 : 0,
            // atype: answer.type === 'IN' ? 1 : 0,
            aclass: 1,
            atype: 1,
            attl: answer.ttl,
            ardata: iptoHexBytes(answer.data),
        });
        break;
    }
  }

//   const answerData = {
//     answers: [
//         {
//             aname: decodedResponse.answers[0].name,
//             aclass: 1,
//             atype: 1,
//             attl: 60,
//             ardata: iptoHexBytes(decodedResponse.answers[0].data),
//         }
//     ]
//   }
  const answerData = {answers: answerArray};
  const answer = createAnswer(answerData);

  return Buffer.concat([header, question, answer]);
};

module.exports = { createResponse };
