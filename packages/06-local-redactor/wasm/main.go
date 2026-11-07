package main

import "unsafe"

const arenaSize = 262144

var ipcArena [arenaSize]byte

//go:wasmexport arena_ptr
func arenaPtr() uint32 {
	return uint32(uintptr(unsafe.Pointer(&ipcArena[0])))
}

//go:wasmexport arena_cap
func arenaCap() uint32 {
	return arenaSize
}

func checkBounds(offset uint32, length uint32) bool {
	if offset > arenaSize || length > arenaSize {
		return false
	}
	return offset+length <= arenaSize
}

//go:wasmexport validate_ssn
func validateSsn(offset uint32, length uint32) uint32 {
	if !checkBounds(offset, length) {
		return 0
	}
	buf := ipcArena[offset : offset+length]
	var digits [9]uint32
	if length == 9 {
		for i := 0; i < 9; i++ {
			c := buf[i]
			if c < '0' || c > '9' {
				return 0
			}
			digits[i] = uint32(c - '0')
		}
	} else if length == 11 {
		sep := buf[3]
		if (sep != '-' && sep != ' ') || buf[6] != sep {
			return 0
		}
		idx := 0
		for i := 0; i < 11; i++ {
			if i == 3 || i == 6 {
				continue
			}
			c := buf[i]
			if c < '0' || c > '9' {
				return 0
			}
			digits[idx] = uint32(c - '0')
			idx++
		}
	} else {
		return 0
	}

	area := digits[0]*100 + digits[1]*10 + digits[2]
	group := digits[3]*10 + digits[4]
	serial := digits[5]*1000 + digits[6]*100 + digits[7]*10 + digits[8]
	if area == 0 || area == 666 || area >= 900 || group == 0 || serial == 0 {
		return 0
	}
	return 1
}

//go:wasmexport validate_luhn
func validateLuhn(offset uint32, length uint32) uint32 {
	if length == 0 || !checkBounds(offset, length) {
		return 0
	}
	buf := ipcArena[offset : offset+length]
	var digits [20]uint32
	count := 0
	nonZero := false
	for i := uint32(0); i < length; i++ {
		c := buf[i]
		if c == ' ' || c == '-' {
			continue
		}
		if c < '0' || c > '9' {
			return 0
		}
		if count >= 19 {
			return 0
		}
		d := uint32(c - '0')
		if d != 0 {
			nonZero = true
		}
		digits[count] = d
		count++
	}
	if count < 13 || count > 19 || !nonZero {
		return 0
	}
	var sum uint32
	alt := false
	for i := count - 1; i >= 0; i-- {
		d := digits[i]
		if alt {
			d *= 2
			if d > 9 {
				d -= 9
			}
		}
		sum += d
		alt = !alt
	}
	if sum%10 == 0 {
		return 1
	}
	return 0
}

//go:wasmexport validate_aba
func validateAba(offset uint32, length uint32) uint32 {
	if length != 9 || !checkBounds(offset, length) {
		return 0
	}
	buf := ipcArena[offset : offset+length]
	var d [9]uint32
	nonZero := false
	for i := 0; i < 9; i++ {
		c := buf[i]
		if c < '0' || c > '9' {
			return 0
		}
		v := uint32(c - '0')
		if v != 0 {
			nonZero = true
		}
		d[i] = v
	}
	if !nonZero {
		return 0
	}
	checksum := 3*(d[0]+d[3]+d[6]) + 7*(d[1]+d[4]+d[7]) + (d[2] + d[5] + d[8])
	if checksum%10 == 0 {
		return 1
	}
	return 0
}

//go:wasmexport validate_iban_mod97
func validateIbanMod97(offset uint32, length uint32) uint32 {
	if length < 15 || !checkBounds(offset, length) {
		return 0
	}
	buf := ipcArena[offset : offset+length]
	var clean [36]byte
	n := 0
	for i := uint32(0); i < length; i++ {
		c := buf[i]
		if c == ' ' {
			continue
		}
		if c >= 'a' && c <= 'z' {
			return 0
		}
		if !((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
			return 0
		}
		if n >= 34 {
			return 0
		}
		clean[n] = c
		n++
	}
	if n < 15 || n > 34 {
		return 0
	}
	if clean[0] < 'A' || clean[0] > 'Z' || clean[1] < 'A' || clean[1] > 'Z' {
		return 0
	}
	if clean[2] < '0' || clean[2] > '9' || clean[3] < '0' || clean[3] > '9' {
		return 0
	}

	var rem uint32
	for step := 0; step < n; step++ {
		idx := (step + 4) % n
		c := clean[idx]
		if c >= '0' && c <= '9' {
			rem = (rem*10 + uint32(c-'0')) % 97
		} else {
			val := uint32(c-'A') + 10
			rem = (rem*100 + val) % 97
		}
	}
	if rem == 1 {
		return 1
	}
	return 0
}

//go:wasmexport rolling_mask_span
func rollingMaskSpan(offset uint32, length uint32, maskByte uint32, preserveDelims uint32) uint32 {
	if length == 0 || !checkBounds(offset, length) {
		return 0
	}
	buf := ipcArena[offset : offset+length]
	var scrubbed uint32
	state := uint32(0x9e3779b9) ^ offset ^ length
	for i := uint32(0); i < length; i++ {
		c := buf[i]
		if preserveDelims != 0 && (c == '-' || c == ' ') {
			continue
		}
		if maskByte != 0 {
			buf[i] = byte(maskByte & 0xff)
		} else {
			state += 0x9e3779b9
			z := state
			z = (z ^ (z >> 16)) * 0x85ebca6b
			z = (z ^ (z >> 13)) * 0xc2b2ae35
			z = z ^ (z >> 16)
			buf[i] = 'X'
			if (z & 1) == 1 {
				buf[i] = '#'
			}
		}
		scrubbed++
	}
	return scrubbed
}

func isWordChar(c byte) bool {
	return (c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c == '-'
}

func writeSpan(outOffset uint32, index uint32, start uint32, end uint32, kind uint32) {
	pos := outOffset + index*12
	ipcArena[pos] = byte(start)
	ipcArena[pos+1] = byte(start >> 8)
	ipcArena[pos+2] = byte(start >> 16)
	ipcArena[pos+3] = byte(start >> 24)
	ipcArena[pos+4] = byte(end)
	ipcArena[pos+5] = byte(end >> 8)
	ipcArena[pos+6] = byte(end >> 16)
	ipcArena[pos+7] = byte(end >> 24)
	ipcArena[pos+8] = byte(kind)
	ipcArena[pos+9] = byte(kind >> 8)
	ipcArena[pos+10] = byte(kind >> 16)
	ipcArena[pos+11] = byte(kind >> 24)
}

//go:wasmexport scan_checksum_spans
func scanChecksumSpans(offset uint32, length uint32, outOffset uint32, maxSpans uint32) uint32 {
	if length == 0 || maxSpans == 0 || !checkBounds(offset, length) || !checkBounds(outOffset, maxSpans*12) {
		return 0
	}
	buf := ipcArena[offset : offset+length]
	var found uint32
	i := uint32(0)

	for i < length && found < maxSpans {
		if i > 0 && isWordChar(buf[i-1]) {
			i++
			continue
		}

		if i+11 <= length && validateSsn(offset+i, 11) == 1 && (i+11 == length || !isWordChar(buf[i+11])) {
			writeSpan(outOffset, found, i, i+11, 1)
			found++
			i += 11
			continue
		}

		if buf[i] >= '0' && buf[i] <= '9' {
			end := i
			digits := 0
			for end < length && ((buf[end] >= '0' && buf[end] <= '9') || buf[end] == ' ' || buf[end] == '-') && digits < 20 {
				if buf[end] >= '0' && buf[end] <= '9' {
					digits++
				}
				end++
			}
			for end > i && (buf[end-1] == ' ' || buf[end-1] == '-') {
				end--
			}
			if digits >= 13 && digits <= 19 && (end == length || !isWordChar(buf[end])) && validateLuhn(offset+i, end-i) == 1 {
				writeSpan(outOffset, found, i, end, 2)
				found++
				i = end
				continue
			}
			if i+9 <= length && (i+9 == length || !isWordChar(buf[i+9])) && validateAba(offset+i, 9) == 1 {
				pfx := (uint32(buf[i]-'0') * 10) + uint32(buf[i+1]-'0')
				if (pfx >= 1 && pfx <= 12) || (pfx >= 21 && pfx <= 32) || (pfx >= 61 && pfx <= 72) || pfx == 80 {
					writeSpan(outOffset, found, i, i+9, 3)
					found++
					i += 9
					continue
				}
			}
		}

		if buf[i] >= 'A' && buf[i] <= 'Z' && i+15 <= length {
			end := i
			for end < length && ((buf[end] >= 'A' && buf[end] <= 'Z') || (buf[end] >= '0' && buf[end] <= '9') || buf[end] == ' ') && (end-i) < 38 {
				end++
			}
			for end > i && buf[end-1] == ' ' {
				end--
			}
			if end-i >= 15 && validateIbanMod97(offset+i, end-i) == 1 {
				writeSpan(outOffset, found, i, end, 4)
				found++
				i = end
				continue
			}
		}

		i++
	}
	return found
}

func main() {}
