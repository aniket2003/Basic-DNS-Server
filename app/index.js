const dgram = require("dgram");
const dnsPacket = require("dns-packet");
const {createQuestionPacket} = require("../CreatePacket/createQuestionPacket");
const { createResponse }= require("../CreatePacket/createResponse");
const FORWARDING_DNS_SERVER = "8.8.8.8";
const FORWARDING_PORT = 53;
const udpSocket = dgram.createSocket("udp4");

udpSocket.bind(2053, "127.0.0.1");
//  Binding it to 2053 Since PORT 53 is Already in use By the DNS
// This is just like the Socket that I used in CWM


udpSocket.on("message", (buf, rinfo)=>{
  try{

    const decodedRequest = dnsPacket.decode(buf);

    if(decodedRequest.questions.length > 1){

    }else{
      const questionPacket = createQuestionPacket(decodedRequest, decodedRequest.questions[0]);
      forwardQuery(questionPacket, rinfo);
    }

  }catch(err){
    console.log("Error: ", err);
  }
})


const forwardQuery = (questionPacket, rinfo)=>{
  const clientSocket = dgram.createSocket("udp4");

  const sendQuery = (packet)=>{

    clientSocket.send(packet, FORWARDING_PORT, FORWARDING_DNS_SERVER, (err)=>{
      if(err){
        console.log("Error sending query to upstream DNS server: ", err);
        clientSocket.close();
        return;
      }
    });

  }

  sendQuery(questionPacket);

  clientSocket.on("message", (buf)=>{

    try{

      const decodedResponse = dnsPacket.decode(buf);
      console.log(decodedResponse);
      
      if (decodedResponse.answers.length > 0) {
        const response = createResponse(decodedResponse, rinfo);
        udpSocket.send(response, rinfo.port, rinfo.address);
      } else {
        console.log(`No answers returned for the query for ${decodedResponse.questions[0].name}`);
        return;
      }
      
      let answer = decodedResponse.answers;
      let finalIp = null;
      let cnameChain = [];
      
      answer.forEach(answer =>{
        if(answer.type === 'CNAME'){
          cnameChain.push(answer.data);
        }else if(answer.type === 'A'){
          finalIp = answer.data;
        }
      })
      
      
      if(cnameChain.length > 0){
        console.log(`Following are the CNAMEs:  ${cnameChain.join(", ")}`);
        console.log("ChainName: ", cnameChain);
        cnameChain.forEach(cname => {
          const newQuestionPacket = createQuestionPacket(decodedResponse, {
            name: cname,
          // tpye: 'A',
          // class: 'IN',
          type: 1,
          class: 1,
        });
        
        sendQuery(newQuestionPacket);
      });
    }else if(finalIp){
      const response = createResponse(decodedResponse, rinfo);
      udpSocket.send(response, rinfo.port, rinfo.address);
    }else{
      console.log(`No valid answer found for ${decodedResponse.questions[0].name}.`);
    }
  }catch(err){
    console.log("Error processing response: ", e);
  }finally{
    clientSocket.close();
  }
  });
  
  clientSocket.on("error", (err)=>{
    console.log("Error receiving response from upstream DNS server: ",err);
    clientSocket.close();
  })
}


udpSocket.on("error", (err) => {
  console.log(`Error in UDP socket: ${err}`);
});

udpSocket.on("listening", () => {
  const address = udpSocket.address();
  console.log(`Server listening ${address.address}:${address.port}`);
});
