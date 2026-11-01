import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const providedPath = path.join(root, 'public/data/provided-hymns.json');
const docxPath = path.join(root, 'public/data/docx-hymns.json');
const provided = JSON.parse(fs.readFileSync(providedPath, 'utf8'));
const docx = JSON.parse(fs.readFileSync(docxPath, 'utf8'));

const verse = (number, text) => ({ number, type: 'verse', text });
const chorus = text => ({ type: 'chorus', text });
const gardenChorus = `And He walks with me, and He talks with me,\nAnd He tells me I am His own,\nAnd the joy we share as we tarry there,\nNone other has ever known.`;
const gloryChorus = `Glory to His name!\nGlory to His name!\nThere to my heart was the blood applied.\nGlory to His name!`;
const angelsChorus = `Gloria in excelsis Deo.\nGloria in excelsis Deo.`;
const stormChorus = `He's the I of the storm\nThe center of my calm\nThe place where I find shelter\nThe place where I find warmth\nThe center of my ways\nThe keeper of my days\nWhen I can't feel the sun shine\nAnd my ship is tossed and torn\nHe's the I of the storm`;

const requested = [
  {
    number: 487,
    title: 'In the Garden',
    authors: 'C. Austin Miles',
    language: 'English',
    sourceUrl: 'https://hymnary.org/text/i_come_to_the_garden_alone',
    verses: [
      verse(1, `I come to the garden alone,\nWhile the dew is still on the roses;\nAnd the voice I hear, falling on my ear,\nThe Son of God discloses.`),
      chorus(gardenChorus),
      verse(2, `He speaks, and the sound of His voice\nIs so sweet the birds hush their singing;\nAnd the melody that He gave to me\nWithin my heart is ringing.`),
      verse(3, `I'd stay in the garden with Him\nTho' the night around me be falling;\nBut He bids me go; thro' the voice of woe,\nHis voice to me is calling.`),
    ],
  },
  {
    number: 142,
    title: 'Angels We Have Heard on High',
    authors: 'James Chadwick',
    language: 'English',
    sourceUrl: 'https://hymnary.org/text/angels_we_have_heard_on_high',
    verses: [
      verse(1, `Angels we have heard on high,\nSweetly singing o'er the plains,\nAnd the mountains in reply\nEchoing their joyous strains.`),
      chorus(angelsChorus),
      verse(2, `Shepherds, why this jubilee?\nWhy your joyous strains prolong?\nWhat the gladsome tidings be\nWhich inspire your heavn'ly song?`),
      verse(3, `Come to Bethlehem and see\nHim whose birth the angels sing.\nCome, adore on bended knee\nChrist the Lord, the newborn King.`),
      verse(4, `See him in a manger laid,\nWhom the choirs of angels praise.\nMary, Joseph, lend your aid\nWhile our hearts in love we raise.`),
    ],
  },
  {
    number: 1534,
    title: 'Glory to His Name',
    authors: 'Elisha A. Hoffman',
    language: 'English',
    sourceUrl: 'https://hymnary.org/text/down_at_the_cross_where_my_savior_di_dow',
    verses: [
      verse(1, `Down at the cross where my Savior died,\nDown where for cleansing from sin I cried,\nThere to my heart was the blood applied.\nGlory to His name!`),
      chorus(gloryChorus),
      verse(2, `I am so wondrously saved from sin;\nJesus so sweetly abides within.\nThere at the cross where He took me in;\nGlory to His name!`),
      verse(3, `O precious fountain that saves from sin!\nI am so glad that I have entered in!\nThere Jesus saves me and keeps me clean;\nGlory to His name!`),
      verse(4, `Come to this fountain so rich and sweet;\nCast thy poor soul at the Savior's feet;\nPlunge in today, and be made complete;\nGlory to His name!`),
    ],
  },
  {
    number: 1535,
    title: 'The Eye of the Storm',
    sourceTitle: 'The I of the Storm',
    language: 'English',
    sourceUrl: '',
    verses: [
      verse(1, `They did not understand why He wouldn't come\nAs they made their way toward the other side\nAs they left the shore, they faced the storm\nAnd suddenly they feared for their lives.\nBut upon the sea there someone walked\nOn the water, as they listened for His cry\nThat's when they heard Him call out their names\nAnd tenderly He said, It is I.`),
      chorus(stormChorus),
      verse(2, `They did not understand how the Prince of Peace\nCould find them in the middle of the sea\nBut with little faith and God's good grace\nJoy would overcome their desperate pleas\nNow there are times in life when I face the storm\nAnd I wonder if I ever will survive\nThat's when I hear Him call out my name\nAnd tenderly He says, It is I.`),
      verse(3, `Do not fear when He is near\nTake hold of His strong hand\nListen closely to His word\nHe's the Great I Am\nThe Great I Am still is\nThe heavens and the earth are His\nHe's the merciful Almighty forever holy\nIn everything we must remember this\nThe Great I Am still is\nThe I of the storm`),
    ],
  },
];

const existing = new Map(docx.hymns.map(h => [String(h.number), h]));
for (const hymn of requested) {
  if (existing.has(String(hymn.number))) {
    throw new Error(`docx-hymns.json already contains source no. ${hymn.number}`);
  }
  existing.set(String(hymn.number), hymn);
}
docx.hymns = [...existing.values()].sort((a, b) => Number(a.number) - Number(b.number));

// Move the corrected existing records into this source-document dataset so
// source numbers 142 and 487 are not duplicated between the two datasets.
const movedNumbers = new Set(['142', '487']);
const before = provided.hymns.length;
provided.hymns = provided.hymns.filter(h => !movedNumbers.has(String(h.number)));
if (before - provided.hymns.length !== 2) {
  throw new Error(`Expected exactly two provided records (142, 487) to move; removed ${before - provided.hymns.length}`);
}
provided.importedCount = provided.hymns.length;

fs.writeFileSync(docxPath, `${JSON.stringify(docx, null, 2)}\n`);
fs.writeFileSync(providedPath, `${JSON.stringify(provided, null, 2)}\n`);
console.log(`Added ${requested.length} hymns to docx-hymns.json; moved duplicate source numbers 142 and 487 out of provided-hymns.json.`);
