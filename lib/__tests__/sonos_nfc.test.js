import nfcCard from 'nfccard-tool';
import { NFC } from 'nfc-pcsc';
import process_sonos_command from '../process_sonos_command.js';
import sonos_nfc from '../sonos_nfc.js';
import EventEmitter from './event_emitter.js';
import logger from '../logger.js';

jest.mock('../process_sonos_command.js');
jest.mock('../logger.js');

describe('sonos_nfc', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('Listens for reader ready event', () => {
    // Setup
    const nfc = {
      on: jest.fn(),
    };

    // Act
    sonos_nfc(nfc);

    // Assert
    expect(nfc.on).toBeCalledWith('reader', expect.any(Function));
  });

  test('Calls process_sonos_command when card text message is successfully processed', async () => {
    // Setup
    const nfc = new EventEmitter();
    const command = 'spotify:abc123';
    const mockReader = new EventEmitter({
      read: () => Promise.resolve(command),
      reader: {
        name: 'Mock Reader',
      },
    });
    const card = {
      type: 'ntag',
      uid: '043A98CABB2B80',
    };

    nfcCard.isFormatedAsNDEF.mockImplementation(() => true);
    nfcCard.hasReadPermissions.mockImplementation(() => true);
    nfcCard.hasNDEFMessage.mockImplementation(() => true);
    nfcCard.parseNDEF.mockImplementation((msg) => [
      {
        type: 'text',
        text: msg,
      },
    ]);

    // Act
    sonos_nfc(nfc);
    await nfc.emit('reader', mockReader);
    await mockReader.emit('card', card);

    // Assert
    expect(process_sonos_command).toHaveBeenCalledWith(command);
  });

  test('Calls process_sonos_command when card URI message is successfully processed', async () => {
    // Setup
    const nfc = new EventEmitter();
    const command = 'spotify:abc123';
    const mockReader = new EventEmitter({
      read: () => Promise.resolve(command),
      reader: {
        name: 'Mock Reader',
      },
    });
    const card = {
      type: 'ntag',
      uid: '043A98CABB2B80',
    };

    nfcCard.isFormatedAsNDEF.mockImplementation(() => true);
    nfcCard.hasReadPermissions.mockImplementation(() => true);
    nfcCard.hasNDEFMessage.mockImplementation(() => true);
    nfcCard.parseNDEF.mockImplementation((msg) => [
      {
        type: 'uri',
        uri: msg,
      },
    ]);

    // Act
    sonos_nfc(nfc);
    await nfc.emit('reader', mockReader);
    await mockReader.emit('card', card);

    // Assert
    expect(process_sonos_command).toHaveBeenCalledWith(command);
  });

  test('Logs error message when card format is invalid', async () => {
    // Setup
    const nfc = new EventEmitter();
    const mockReader = new EventEmitter({
      read: () => Promise.resolve({}),
      reader: {
        name: 'Mock Reader',
      },
    });
    const card = {
      type: 'ntag',
      uid: '043A98CABB2B80',
    };

    // Act
    sonos_nfc(nfc);
    await nfc.emit('reader', mockReader);
    await mockReader.emit('card', card);

    // Assert
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Could not parse anything from this tag')
    );
  });

  test('Logs message when card is removed', async () => {
    // Setup
    const nfc = new EventEmitter();
    const mockReader = new EventEmitter({
      read: jest.fn((start, end) => Promise.resolve(new Buffer())),
      reader: {
        name: 'Mock Reader',
      },
    });
    const card = {
      type: 'ntag',
      uid: '043A98CABB2B80',
    };

    // Act
    sonos_nfc(nfc);
    await nfc.emit('reader', mockReader);
    await mockReader.emit('card.off', card);

    // Assert
    expect(logger.info).toHaveBeenNthCalledWith(
      3,
      `${mockReader.reader.name}: ${card.type} with UID ${card.uid} removed`
    );
  });

  test('Logs error message when card can’t be read', async () => {
    // Setup
    const nfc = new EventEmitter();
    const error = 'Nope, did not work';
    const mockReader = new EventEmitter({
      read: () => Promise.reject(error),
      reader: {
        name: 'Mock Reader',
      },
    });
    const card = {
      type: 'ntag',
      uid: '043A98CABB2B80',
    };

    // Act
    sonos_nfc(nfc);
    await nfc.emit('reader', mockReader);
    await mockReader.emit('card', card);

    // Assert
    expect(logger.error).toHaveBeenCalledWith(error);
  });

  test('Logs message when card is removed', async () => {
    // Setup
    const nfc = new EventEmitter();
    const mockReader = new EventEmitter({
      read: jest.fn((start, end) => Promise.resolve(new Buffer())),
      reader: {
        name: 'Mock Reader',
      },
    });
    const card = {
      type: 'ntag',
      uid: '043A98CABB2B80',
    };

    // Act
    sonos_nfc(nfc);
    await nfc.emit('reader', mockReader);
    await mockReader.emit('card.off', card);

    // Assert
    expect(logger.info).toHaveBeenNthCalledWith(
      3,
      `${mockReader.reader.name}: ${card.type} with UID ${card.uid} removed`
    );
  });

  test('Logs message when reader throws error', async () => {
    // Setup
    const nfc = new EventEmitter();
    const mockReader = new EventEmitter({
      read: jest.fn((start, end) => Promise.resolve(new Buffer())),
      reader: {
        name: 'Mock Reader',
      },
    });
    const error = 'Nope, did not work';

    // Act
    sonos_nfc(nfc);
    await nfc.emit('reader', mockReader);
    await mockReader.emit('error', error);

    // Assert
    expect(logger.error).toHaveBeenCalledWith(
      `${mockReader.reader.name} an error occurred`,
      error
    );
  });

  test('Logs message when reader is disconnected', async () => {
    // Setup
    const nfc = new EventEmitter();
    const mockReader = new EventEmitter({
      read: jest.fn((start, end) => Promise.resolve(new Buffer())),
      reader: {
        name: 'Mock Reader',
      },
    });

    // Act
    sonos_nfc(nfc);
    await nfc.emit('reader', mockReader);
    await mockReader.emit('end');

    // Assert
    expect(logger.warn).toHaveBeenCalledWith(
      `${mockReader.reader.name} device removed`
    );
  });

  test('Logs message when NFC library returns error', async () => {
    // Setup
    const nfc = new EventEmitter();
    const error = 'Nope, did not work';

    // Act
    sonos_nfc(nfc);
    await nfc.emit('error', error);

    // Assert
    expect(logger.error).toHaveBeenCalledWith('an NFC error occurred', error);
  });
});
