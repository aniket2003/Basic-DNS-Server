const createAnswer = (data)=>{
    const domainsanddata = data.answers;
    const answerBuffers = [];
  
    domainsanddata.map((answer) => {
      const { aname, atype, aclass, attl, ardata } = answer;
      const response = Buffer.alloc(10);
      const ConvertToLabelSequence = aname
        .split(".")
        .map(
          (partition) => `${String.fromCharCode(partition.length)}${partition}`
        )
        .join("");
      const buffer = Buffer.from(ConvertToLabelSequence + "\0", "binary");
      response.writeUInt16BE(atype, 0);
      response.writeUInt16BE(aclass, 2);
      response.writeUInt32BE(attl, 4);
      response.writeUInt16BE(ardata.length, 8);

  
      answerBuffers.push(Buffer.concat([buffer, response, 
        Buffer.from(ardata, "binary")
      ]));
    });
  
    return Buffer.concat(answerBuffers);


}

module.exports = {createAnswer};