import nfcCard from 'nfccard-tool';
import process_sonos_command from './process_sonos_command.js';

const sonos_nfc = (nfc) => {
  console.log(
    'Control your Sonos with NFC cards. Searching for PCSC-compatible NFC reader devices...'
  );

  nfc.on('reader', (reader) => {
    console.log(`${reader.reader.name} device attached`);

    reader.on('card', async (card) => {
      // card is object containing following data
      // String standard: TAG_ISO_14443_3 (standard nfc tags like MIFARE Ultralight) or TAG_ISO_14443_4 (Android HCE and others)
      // String type: same as standard
      // Buffer atr

      console.log(
        `${reader.reader.name} detected ${card.type} with UID ${card.uid}`
      );

      try {
        /**
         *  1 - READ HEADER
         *  Read from block 0 to block 4 (20 bytes length) in order to parse tag information
         *  Block 4 is the first data block -- should have the TLV info
         */
        const cardHeader = await reader.read(0, 20);

        const tag = nfcCard.parseInfo(cardHeader);
        // console.log('tag info:', JSON.stringify(tag))

        /**
         *  2 - Read the NDEF message and parse it if it's supposed there is one
         *  The NDEF message must begin in block 4 -- no locked bits, etc.
         *  Make sure cards are initialized before writing.
         */

        if (
          nfcCard.isFormatedAsNDEF() &&
          nfcCard.hasReadPermissions() &&
          nfcCard.hasNDEFMessage()
        ) {
          // Read the appropriate length to get the NDEF message as buffer
          const NDEFRawMessage = await reader.read(
            4,
            nfcCard.getNDEFMessageLengthToRead()
          ); // starts reading in block 0 until end

          // Parse the buffer as a NDEF raw message
          const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage);

          // console.log('NDEFMessage:', NDEFMessage)

          for (const record of NDEFMessage) {
            let service_type, sonos_instruction;
            switch (record.type) {
              case 'uri':
                record.text = record.uri;
              case 'text':
                const received_text = record.text;
                console.log('Read from NFC tag with message: ', received_text);

                await process_sonos_command(received_text);
            }
          }
        } else {
          console.log(
            'Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable.'
          );
        }
      } catch (err) {
        console.error(err.toString());
      }
    });

    reader.on('card.off', (card) => {
      console.log(
        `${reader.reader.name}: ${card.type} with UID ${card.uid} removed`
      );
    });

    reader.on('error', (err) => {
      console.log(`${reader.reader.name} an error occurred`, err);
    });

    reader.on('end', () => {
      console.log(`${reader.reader.name} device removed`);
    });
  });

  nfc.on('error', (err) => {
    console.log('an NFC error occurred', err);
  });
};

export default sonos_nfc;
