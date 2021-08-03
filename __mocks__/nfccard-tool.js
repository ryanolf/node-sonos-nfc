const NfccardTool = {
  parseInfo: jest.fn(),
  isFormatedAsNDEF: jest.fn(),
  hasReadPermissions: jest.fn(),
  hasNDEFMessage: jest.fn(),
  getNDEFMessageLengthToRead: jest.fn(),
  parseNDEF: jest.fn(),
};

export default NfccardTool;
