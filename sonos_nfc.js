import {NFC} from 'nfc-pcsc'
import ndef from 'nfccard-tool'
const nfcCard = ndef
import fetch from 'node-fetch'
import fs from 'fs'

var {sonos_room, sonos_http_api} = JSON.parse(fs.readFileSync('usersettings.json', 'utf-8'))

const nfc = new NFC()

console.log("Control your Sonos with NFC cards. Searching for PCSC-compatible NFC reader devices...")

nfc.on('reader', reader => {

    console.log(`${reader.reader.name} device attached`)

    reader.on('card', async card => {

        // card is object containing following data
        // String standard: TAG_ISO_14443_3 (standard nfc tags like MIFARE Ultralight) or TAG_ISO_14443_4 (Android HCE and others)
        // String type: same as standard
        // Buffer atr

        console.log(`${reader.reader.name} detected %s with UID %s`, card.type, card.uid)

        try {
            /**
             *  1 - READ HEADER
             *  Read from block 0 to block 4 (20 bytes length) in order to parse tag information
             *  Block 4 is the first data block -- should have the TLV info
             */
            const cardHeader = await reader.read(0, 20)
      
            const tag = nfcCard.parseInfo(cardHeader)
            // console.log('tag info:', JSON.stringify(tag))
      
            /**
             *  2 - Read the NDEF message and parse it if it's supposed there is one
             *  The NDEF message must begin in block 4 -- no locked bits, etc.
             *  Make sure cards are initialized before writing.
             */

            if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) {
      
                // Read the appropriate length to get the NDEF message as buffer
                const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead()) // starts reading in block 0 until end
      
                // Parse the buffer as a NDEF raw message
                const NDEFMessage = nfcCard.parseNDEF(NDEFRawMessage)
      
                // console.log('NDEFMessage:', NDEFMessage)
                
                for (const record of NDEFMessage) {
                    let service_type, sonos_instruction
                    switch (record.type) {
                        case 'uri':
                            record.text = record.uri
                        case 'text':
                            const received_text = record.text.toLowerCase()
                            console.log('Read from NFC tag with message: ', received_text)
                            
                            if (received_text.startsWith('apple:')) {
                                service_type = "applemusic"
                                sonos_instruction = "applemusic/now/" + received_text.slice(6)
                            
                            } else if (received_text.startsWith('applemusic:')) {
                                service_type = "applemusic"
                                sonos_instruction = "applemusic/now/" + received_text.slice(11)

                            } else if (received_text.startsWith('http')) {
                                service_type = "completeurl"
                                sonos_instruction = received_text
                           
                            } else if (received_text.startsWith('spotify:')) {
                                service_type = "spotify"
                                sonos_instruction = "spotify/now/" + received_text

                            } else if (received_text.startsWith('tunein:')) {
                                service_type = "tunein"
                                sonos_instruction = "tunein/now/" + received_text

                            } else if (received_text.startsWith('amazonmusic:')) {
                                service_type = "amazonmusic"
                                sonos_instruction = "amazonmusic/now/" + received_text.slice(12)

                            } else if (received_text.startsWith('command:')) {
                                service_type = "command"
                                sonos_instruction = received_text.slice(8)

                            } else if (received_text.startsWith('room:')) {
                                sonos_room = received_text.slice(5)
                                console.log("Sonos room changed to %s", sonos_room)
                                return
                            }  
                    }

                    if (!service_type) {
                        console.log("Service type not recognised. NFC tag text should begin 'spotify', 'tunein', 'amazonmusic', 'apple'/'applemusic', 'command' or 'room'.")
                        return
                    }

                    console.log("Detected '%s' service request", service_type)

                    if (service_type != "command") {
                        console.log("Clearing Sonos queue")
                        const res = await fetch(sonos_http_api + "/" + sonos_room + "/clearqueue")
                        if (!res.ok) throw new Error(`Unexpected response while clearing queue: ${res.status}`)
                    }

                    let urltoget
                    if (service_type == "completeurl") {
                        urltoget = sonos_instruction
                    } else {
                        urltoget = sonos_http_api + "/" + sonos_room + "/" + sonos_instruction
                    }
                    
                    // Perform the requested action on the sonos API
                    console.log("Fetching URL via HTTP: %s", urltoget)
                    const res = await fetch(urltoget)
                    if (!res.ok) throw new Error(`Unexpected response while sending instruction: ${res.status}`)
                    console.log("Sonos API reports: ", await res.json())
                }
      
            } else {
              console.log('Could not parse anything from this tag: \n The tag is either empty, locked, has a wrong NDEF format or is unreadable.')
            }
            
        } catch (err) {
            console.error(`error when reading data or communicating with sonos API`, err)
        }
      
    })
    
    reader.on('card.off', card => {	
        console.log(`${reader.reader.name}: %s with UID %s removed`, card.type, card.uid)
    })

    reader.on('error', err => {
        console.log(`${reader.reader.name} an error occurred`, err)
    })

    reader.on('end', () => {
        console.log(`${reader.reader.name}  device removed`)
    })

})

nfc.on('error', err => {
    console.log('an NFC error occurred', err)
})