# Install and run

Make sure your card reader will work, e.g. for ACR122U on Ubuntu/Debian:

 * Install libacsccid1
   > sudo apt install libacsccid1
 * Blacklist pn533, pn533_usb, nfc modules so that they don't hijack the card reader
   > printf '%s\n' 'pn533' 'pn533_usb' 'nfc' | sudo tee /etc/modprobe.d/blacklist-nfc.conf 
 * Install pcsc stuff (e.g. packages https://github.com/pokusew/node-pcsclite)
   > sudo apt install libpcsclite1 libpcsclite-dev pcscd

Install node and npm, e.g. [these instructions](https://github.com/nodesource/distributions/blob/master/README.md), 
so that you can run this code. On Ubuntu:

> curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
> sudo apt-get install -y nodejs

Install git and clone this repo.

> sudo apt install git
> git clone https://github.com/ryanolf/node-sonos-nfc.git

Install dependencies.
> cd node-sonos-nfc
> npm install

Run the program
> node sonos_nfc.js

To run continuously and at boot, you'll want to run under some supervisor program. 
There are lots of options, like systemd (built-in already), supervisord, and pm2.
I have found pm2 to be very easy to use. To have pm2 spin-up sonos_nfc at boot and keep it
running, install pm2 globally:

> sudo npm install -g pm2

Then spin-up sonos_nfc:

> pm2 start sonos_nfc.js

Then configure your system to run the startup script by running

> pm2 startup

and follow the directions, e.g.

> sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi

Then reboot to make sure the blacklisted modules are not loaded.

> sudo reboot

# Debug

You can monitor the process output to see what's going on. If you're using pm2, you can see the process output via

> pm2 log



