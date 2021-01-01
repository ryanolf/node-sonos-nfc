import http from 'http'
import { NFC} from 'nfc-pcsc'
import ndef from 'nfccard-tool'

const nfcCard = ndef

const nfc = new NFC() // optionally you can pass logger

nfc.on('reader', reader => {

    console.log(`${reader.reader.name}  device attached`);

    reader.on('card', async card => {

        // card is object containing following data
        // String standard: TAG_ISO_14443_3 (standard nfc tags like MIFARE Ultralight) or TAG_ISO_14443_4 (Android HCE and others)
        // String type: same as standard
        // Buffer atr

        console.log(`${reader.reader.name}  card inserted`, card);

        try {

            /**
             * READ MESSAGE AND ITS RECORDS
             */
      
            /**
             *  1 - READ HEADER
             *  Read from block 0 to block 4 (20 bytes length) in order to parse tag information
             */
            // Starts reading in block 0 until end of block 4
            const cardHeader = await reader.read(0, 20);
      
            const tag = nfcCard.parseInfo(cardHeader);
            console.log('tag info:', JSON.stringify(tag));

      
            /**
             *  2 - Read the NDEF message and parse it if it's supposed there is one
             */
      
            // There might be a NDEF message and we are able to read the tag
            if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) {
      
              // Read the appropriate length to get the NDEF message as buffer
              const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead()); // starts reading in block 0 until end
      
              // Parse the buffer as a NDEF raw message
              const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage);
      
              console.log('NDEFMessage:', NDEFMessage);
                
                for (const record of NDEFMessage) {
                    let servicetype, sonosinstruction
                    switch (record.type) {
                        case 'text':
                            const received_text = record.text.toLowerCase()
                            console.log('Read from NFC tag text message: ', received_text)
                            if (received_text.startsWith('apple:')) {
                                servicetype = "applemusic"
                                sonosinstruction = "applemusic/now/" + received_text.slice(6)
                            }
                            break
                    }
                    if (servicetype) {
                        const urltoget = "http://localhost:5005/Living Room/" + sonosinstruction
                    
                        if (servicetype != "command") {
                            console.log("Clearing Sonos queue")
                            http.get("http://localhost:5005/Living Room/clearqueue", (res) => {
                                if (res.statusCode !== 200) {
                                    console.error(`Request Failed. Status Code: ${statusCode}`)
                                    res.resume()
                                    return
                                }
                            }).on('error', (e) => {
                                console.error(`Got error: ${e.message}`)
                            })
                        }
       
                        // use the request function to get the URL built previously, triggering the sonos
                        console.log("Fetching URL via HTTP: ", urltoget)
                        http.get(urltoget, (res) => {
                            if (res.statusCode !== 200) {
                                console.error(`Request Failed. Status Code: ${statusCode}`)
                                res.resume()
                                return
                            }
                            res.setEncoding('utf8');
                            let rawData = '';
                            res.on('data', (chunk) => { rawData += chunk; });
                            res.on('end', () => {
                                try {
                                    const parsedData = JSON.parse(rawData);
                                    console.log("Sonos API reports ", parsedData);
                                } catch (e) {
                                    console.error(e.message);
                                }
                            })
                        }).on('error', (e) => {
                            console.error(`Got error: ${e.message}`)
                        })
                    }
                }
      
            } else {
              console.log('Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable.')
            }

        } catch (err) {
            console.error(`error when reading data`, err);
          }
      
    });
    
    reader.on('card.off', card => {	
        console.log(`${reader.reader.name}  card removed`, card);
    });

    reader.on('error', err => {
        console.log(`${reader.reader.name}  an error occurred`, err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name}  device removed`);
    });

});

nfc.on('error', err => {
    console.log('an error occurred', err);
});