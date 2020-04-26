# From scratch

> If you wish to make an apple pie from scratch, you must first invent the universe. - Carl Sagan

Implement various stuff from scratch. Goes without saying, but don't use any of this for anything serious - it will probably break the first chance it gets.

## [Befunge](befunge)

Befunge is a stack-based, reflective, esoteric programming language. It differs from conventional languages in that programs are arranged on a two-dimensional grid.

## [Bencode](bencode)

Bencode (pronounced like B-encode) is the encoding used by the peer-to-peer file sharing system BitTorrent for storing and transmitting loosely structured data.

## [Brainf\*\*k](branf)

An esoteric programming language created in 1993 by Urban Müller, and is notable for its extreme minimalism.

## [Huffman coding](huffman-code)

In computer science and information theory, a Huffman code is a particular type of optimal prefix code that is commonly used for lossless data compression.

## In progress

## [BitTorrent](torrent)

BitTorrent is a communication protocol for peer-to-peer file sharing (P2P) which is used to distribute data and electronic files over the Internet.

- [x] Torrent file processing
- [ ] Tracker server
- [ ] Tracker communication
  - [ ] http/https
  - [ ] udp
- [ ] Downloader

### [png](png)

- [x] File parser
  - [x] Extract chunks
  - [ ] Checksum (optional)
    - [ ] CRC-32
- [x] Header parser
- [x] Palette parser
- [ ] Decompress data
  - [ ] Deflate
    - [x] Huffman encoding
- [ ] Interlace support
- [ ] Filter support

## TODO plan/ideas

- [ ] sha1
- [ ] sha256
- [ ] md5
- [ ] rsa
