const createDNSHeader  = (data) => {
    const flags =
      data.qr |
      data.opcode |
      data.aa |
      data.tc |
      data.rd |
      data.ra |
      data.z |
      data.rcode;
  
    const response = Buffer.alloc(12);
  
    response.writeUInt16BE(data.id, 0);
  
    response.writeUInt16BE(flags, 2);
    response.writeUInt16BE(data.qdcount, 4);
    response.writeUInt16BE(data.ancount, 6);
    response.writeUInt16BE(data.nscount, 8);
    response.writeUInt16BE(data.arcount, 10);
  
  
    return response;
  }
  
  module.exports = {createDNSHeader};
  