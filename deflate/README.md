# deflate

CLI usage: `node encode <data>` and `node decode <data>`

# Sources

- [zlib spec rfc1950](ftp://ftp.isi.edu/in-notes/rfc1950.txt)
- [deflate spec rfc1951](ftp://ftp.isi.edu/in-notes/rfc1951.txt)

# Example

## Encode

Input: `A_DEAD_DAD_CEDED_A_BAD_BABE_A_BEADED_ABACA_BED`

Output: `1000011101001000110010011101100111001001000111110010011111011111100010001111110100111001001011111011101000111111001 A10,_00,D01,E110,C1110,B1111 46`

## Decode

Input: `1000011101001000110010011101100111001001000111110010011111011111100010001111110100111001001011111011101000111111001 A10,_00,D01,E110,C1110,B1111 46`

Output: `A_DEAD_DAD_CEDED_A_BAD_BABE_A_BEADED_ABACA_BED`

Compression method/flags code: 1 byte
Additional flags/check bits: 1 byte
Compressed data blocks: n bytes
Check value: 4 bytes

Compression 0
zlib method 8
window size up to 32768b
