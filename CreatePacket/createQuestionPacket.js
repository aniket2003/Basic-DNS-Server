const { createDNSHeader } = require("../Dns-Sections/Header");
const { createQuestion } = require("../Dns-Sections/Question");

const createQuestionPacket = (decodedRequest, question)=>{

  console.log("Type:::::: ", question.class);

    const questionData = {
        id: decodedRequest.id,
        qr: 0, // This is a query
        opcode: 0,
        aa: 0,
        tc: 0,
        rd: 1,
        ra: 0,
        z: 0,
        rcode: 0,
        qdcount: 1,
        ancount: 0,
        nscount: 0,
        arcount: 0,
        questions: [
          {
            qname: question.name,
            // qtype: question.type === 'A' ? 1 : 0,
            // qclass: question.class === 'IN' ? 1 : 0,
            qtype: 1,
            qclass: 1,
          },
        ],
    }

    const header = createDNSHeader(questionData);
    const qData = createQuestion(questionData);

    return Buffer.concat([header, qData]);
}


module.exports = {createQuestionPacket};