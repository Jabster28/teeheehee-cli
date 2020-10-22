/* eslint-disable no-process-exit */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {command} from 'yargs';
// @ts-ignore
import {text} from 'input';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import axios from 'axios';

command(['label', '$0'], 'label a file for use in the CDN', {}, () => {
  text('Please list all labels, separated by spaces:').then((e: string) => {
    text("Please drag and drop the file (it'll be renamed):").then(
      async (file: string) => {
        console.log('Hashing file, please wait...');
        const fd = fs.createReadStream(file.replace(/\\/g, ''));
        const hash = crypto.createHash('sha1');
        hash.setEncoding('hex');

        fd.on('end', async () => {
          hash.end();

          const hashish = hash.read().slice(0, 7);
          console.log('Checking if file exist...');
          const memes: string[] = (
            await axios('https://teeheehee.club/list.php')
          ).data;
          memes.forEach(e => {
            if (e.split(' ').includes(`(${hashish})`)) {
              console.log('File exists over a different name: "' + e + '"');
              process.exit(0);
            }
          });
          fs.rename(
            file.trim().replace(/\\/g, ''),
            path.join(
              file
                .replace(/\\/g, '')
                .split('/')
                .slice(0, file.replace(/\\/g, '').trim().split('/').length - 1)
                .join('/'),
              `(${hashish}) ${e}.${file
                .replace(/\\/g, '')
                .split('.')[1]
                .toLowerCase()}`
            ),
            () => {
              console.log('Done!');
            }
          ); // the desired sha1sum
        });

        // read all file and pipe it (write it) to the hash object
        fd.pipe(hash);
      }
    );
  });
})
  .demandCommand()
  .help()
  .wrap(72).argv;
