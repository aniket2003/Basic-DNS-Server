const createQuestion = (data) => {
    const questions = data.questions;
    const questionBuffers = [];
  
    questions.map((question) => {
      const { qname, qtype, qclass } = question;
      const ConvertToLabelSequence = qname
        .split(".")
        .map(
          (partition) => `${String.fromCharCode(partition.length)}${partition}`
        )
        .join("");
      console.log("Partitions : ",ConvertToLabelSequence);
      const buffer = Buffer.from(ConvertToLabelSequence + "\0", "binary");
      const response = Buffer.alloc(4);
      response.writeUInt16BE(qtype, 0);
      response.writeUInt16BE(qclass, 2);
  
      questionBuffers.push(Buffer.concat([buffer, response]));
    });
  
    return Buffer.concat(questionBuffers);
  };
  
  module.exports = { createQuestion };
  