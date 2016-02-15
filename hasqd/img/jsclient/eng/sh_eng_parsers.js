// Hasq Technology Pty Ltd (C) 2013-2016

function engGetResponse(d) {
    // returns response header
    var r = {};
    var response = d.replace(/\r|\s+$/g, '');
    var blocks = response.split(/\s/); // split by by \s (\s, \n, \t, \v);
    var lines = response.split(/\n/); // split by \n only;

    if (lines.length == 0 || blocks[0] == 0) {
        r.content = 'NO_OUTPUT';
        r.message = 'ERROR';
    } else if (lines[0] === 'OK') {
        r.content = response.replace(/^OK/, '');
        r.message = 'OK'
    } else if (blocks[0] === 'OK') {
        r.content = response.replace(/^OK\s/, '');
        r.message = 'OK';
    } else if (blocks[0] === 'IDX_NODN') {
        r.content = blocks[0];
        r.message = blocks[0];
    } else if (
        blocks[0] === 'REQ_HASHTYPE_BAD' ||
        blocks[0] === 'URF_BAD_FORMAT' ||
        blocks[0] === 'REQ_MSG_HEAD' ||
        blocks[0] === 'REQ_DN_BAD' ||
        blocks[0] === 'REC_INIT_BAD_N' ||
        blocks[0] === 'REC_INIT_BAD_S' ||
        blocks[0] === 'REC_INIT_BAD_KGO') {
        r.content = blocks[0];
        r.message = 'ERROR';
    } else {
        r.content = response;
        r.message = 'ERROR';
    }
    return r;
}

function engGetResponseInfoDb(d) {
    // returns parsed 'info db' response
    var r = [];

    var response = engGetResponse(d);

    if (response.message != 'OK' || response.length == 0) {
        return response;
    }

    var rawDbData = response.content;

    rawDbData = rawDbData.replace(/{\n|}+$/g, '');
    rawDbData = rawDbData.split(/}\n/);

    if (rawDbData.length < 1) {
        return rawDbData;
    }

    for (var i = 0; i < rawDbData.length; i++) {
        r[i] = {};
        var traitLines = {};

        traitLines[i] = rawDbData[i].split(/\n/);

        var lines = traitLines[i];
        for (var j = 0; j < (lines.length - 1); j++) {
            var parts = lines[j].split('=');

            switch (parts[0]) {
            case 'name':
                r[i].name = parts[1];
                break;
            case 'hash':
                r[i].hash = parts[1];
                break;
            case 'rawS':
                r[i].rawS = parts[1];
                break;
            case 'nG':
                r[i].ng = parts[1];
                break;
            case 'magic':
                r[i].magic = parts[1].replace(/^\[|\]$/g, '');
                break;
            case 'size':
                r[i].size = parts[1];
                break;
            case 'thin':
                r[i].thin = parts[1];
                break;
            case 'datalimit':
                r[i].datalim = parts[1];
                break;
            case 'altname':
                r[i].altname = parts[1];
                break;
            default:
                break;
            }
        }
    }
    return r;
}

function engGetResponseLast(d) {
    // returns parsed 'last' response
    var r = {};
    r.content = 'OK';
    r.message = 'OK';

    parsedData = engGetResponse(d);

    if (parsedData.message != 'OK' || parsedData.length == 0) {
        return parsedData;
    }

    var dataContent = parsedData.content;
    var parts = dataContent.split(/\s/);
    if (parts.length < 5) {
        r.message = 'ERROR';
        r.content = parts;
    } else if (parts.length == 5) {
        r.n = +parts[0];
        r.s = parts[1];
        r.k = parts[2];
        r.g = parts[3];
        r.o = parts[4];
        r.d = '';
    } else if (parts.length > 5) {
        r.n = +parts[0];
        r.s = parts[1];
        r.k = parts[2];
        r.g = parts[3];
        r.o = parts[4];
        d = [];
        for (var i = 5; i < parts.length; i++) {
            d[d.length] = parts[i];
        }
        r.d = d.join(' ');
    }

    return r;
}

function engGetNewRecord(n, s, p0, p1, p2, m, h) {
    // generates new record
    var r = {};
    r.n = '';
    r.s = '';
    r.k = '';
    r.g = '';
    r.o = '';

    var n0 = +n;
    var n1 = +n + 1;
    var n2 = +n + 2;

    var k0 = engGetKey(n0, s, p0, m, h);

    if ((p1 == null) || (p2 == null)) {
        var k1 = engGetKey(n1, s, p0, m, h);
        var k2 = engGetKey(n2, s, p0, m, h);
    } else {
        var k1 = engGetKey(n1, s, p1, m, h);
        var k2 = engGetKey(n2, s, p2, m, h);
    }

    var g0 = engGetKey(n1, s, k1, m, h);
    var g1 = engGetKey(n2, s, k2, m, h);
    var o0 = engGetKey(n1, s, g1, m, h);

    r.n = n0;
    r.s = s;
    r.k = k0;
    r.g = g0;
    r.o = o0;

    return r;
}

function engGetKey(n, s, p, m, h) {
    var raw_k = n + ' ' + s + ' ' + p;

    if (m != '') {
        raw_k += ' ' + m;
    }

    return engGetHash(raw_k, h); ;
}

function engIsHash(d, h) {
    //checks string is hash or not hash
    var notHex = /[^0-9a-f]/g;
    var r = true;
    switch (h) {
    case 'md5':
        var l = 32;
        break;
    case 'r16':
        var l = 40;
        break;
    case 's22':
        var l = 64;
        break;
    case 's25':
        var l = 128;
        break;
    case 'wrd':
        var l = 4;
        break;
    case 'smd':
        var l = 32;
        break;
    default:
        break;
    }

    if (d.length != l || notHex.test(d)) { //mismatched length or not not hex chars contents
        return false;
    } else {
        return true;
    };
}

function engGetHash(d, h) {
    //returns specified hash of 'd'
    switch (h) {
    case 'wrd':
        return hex_md5(d).substring(0, 4);
    case 'md5':
        return hex_md5(d);
    case 'r16':
        return hex_rmd160(d);
    case 's22':
        return hex_sha256(d);
    case 's25':
        return hex_sha512(d);
    case 'smd':
        return hex_smd(d);
    default:
        break;
    }
    return null;
}

function engGetTokensStatus(lr, nr) {
    // returns current matching of password
	
    // Tokens keys is fully matched with a password
	if ((lr.g === nr.g) && (lr.o === nr.o)) return 1; 
	// Token is in a sending process
	if (lr.g === nr.g) return 2;
	// Token is in a receiving process
	if (lr.o === nr.o) return 3; 
	// Tokens keys is not matched with a password
	return 0; 
}

function engGetOutputDataValue(d) {
    // returns parsed data for displaying
    var r = d;
    if (r !== undefined && r.length > 0) {
        var lf = '\u000a'; //unicode line-feed

        for (var i = 0; i < r.length; i++) {
            if (r[i] === '\u005c' && r[i + 1] === '\u005c' && r[i + 2] === '\u006e') {
                // "\\n" > "\n", "\\\n" > "\\n"
                r = r.substring(0, i) + r.substr(i + 1);
                i++; // need check;
            } else if (r[i] === '\u005c' && r[i + 1] === '\u006e') {
                // "\n" > LF
                r = r.substring(0, i) + lf + r.substr(i + 2);
            } else if (r[i] === '\u005c' && r[i - 1] === '\u0020' && r[i + 1] === '\u0020') {
                // "a \ a" > "a, "a \ \ a" > "a   a", "a\ " > "a\ "
                r = r.substring(0, i) + r.substr(i + 1);
            }
        }
    }
    return r;

}

function engGetInputDataValue(d) {
    // returns parsed data for add into record
    var r = d.replace(/^\s+|\s+$/g, '');
    if (r !== undefined && r.length > 0) {
        for (var i = 0; i < r.length; i++) {
            if (r[i] === '\u0020' && r[i + 1] === '\u0020') {
                // "a  a" -> "a \ a", "  " -> ""
                r = r.substring(0, i + 1) + '\u005c' + r.substr(i + 1, r.length);
                i++;
            } else if (r[i] === '\u000a') {
                // LF  > "\n"
                r = r.substring(0, i) + '\u005c\u006e' + r.substr(i + 1);
            }
        }
    }
    return r;
}

function engGetTransKeys(rawKeys) {
	var prK1K2 = '23132';
    var prG2O2 = '24252';
    var prK1G1 = '23141'; 
    var prK2 = '232';
    var prO1 = '251'; 

	var transKeys = [];
	
	var keys = rawKeys.replace(/^\s+|\s+$/g, '').split(/\n/); //split by linefeed;
	var prLine = keys.splice(keys.length - 1, 1)[0].split(/\s/); //get last (protocol) line and split by spaces;
	var prCode = prLine[prLine.length - 1]; // get protocol key;
	var numFlag = prCode.charAt(0);
	var dbFlag = (prCode.charAt(prCode.length - 1) == '0') ? '0' : '';
	var coef = (numFlag == '0') ? 1 : 0; // if protocol have record numbers;
	
	prK1K2 = numFlag + prK1K2 + dbFlag;
	prG2O2 = numFlag + prG2O2 + dbFlag;
	prK1G1 = numFlag + prK1G1 + dbFlag;
	prK2 = numFlag + prK2 + dbFlag;
	prO1 = numFlag + prO1 + dbFlag;
	
    for (var i = 0; i < keys.length; i++) {
/*
		keys[i] = keys[i].replace(/^\s+|\s+$/, '');
        if ((keys[i] === undefined) || (keys[i] === null) || (keys[i].length == 0)) {
            keys.splice(i, 1);
            i--;
			break;
        }
*/		
		var el = keys[i].split(/\s/);

		transKeys[i] = {};
		transKeys[i].protocode = prCode;
		transKeys[i].n = (coef == 1) ? transKeys[i].n = -1 : transKeys[i].n = +el[0];// if protocol have record numbers n = -1;
		transKeys[i].s = el[1 - coef];
		
		switch (prCode) {
		case (prK1K2):
			transKeys[i].k1 = el[2 - coef];
			transKeys[i].k2 = el[3 - coef];
			break;
		case (prG2O2):
			transKeys[i].g2 = el[2 - coef];
			transKeys[i].o2 = el[3 - coef];
			break;
		case (prK1G1):
			transKeys[i].k1 = el[2 - coef];
			transKeys[i].g1 = el[3 - coef];
			break;
		case (prK2):
			transKeys[i].k2 = el[2 - coef];
			break;
		case (prO1):
			transKeys[i].o1 = el[2 - coef];
			break;
		default:
			break;
		}			
    }

    transKeys.sort(engSortByProperties('s'));

	// if presents keys for same token;
    for (var i = 0; i < transKeys.length - 1; i++) {
        if (transKeys[i].s == transKeys[i + 1].s) {
            transKeys.splice(i + 1, 1);
            i--;
        };
    }

    return transKeys;
}

function engGetEnrollKeys(transKeys, p, h, m) {
    var enrollKeys = transKeys;
	var prK1K2 = '23132'; 
    var prG2O2 = '24252';
    var prK1G1 = '23141';
    var prK2 = '232';
    var prO1 = '251';
	
	var prCode = transKeys[0].protocode; // get protocol key from first element;
	var numFlag = prCode.charAt(0);
	var dbFlag = (prCode.charAt(prCode.length - 1) == '0') ? '0' : '';
	var coef = (numFlag == '0') ? 1 : 0; // if protocol have record numbers;
	
	prK1K2 = numFlag + prK1K2 + dbFlag;
	prG2O2 = numFlag + prG2O2 + dbFlag;
	prK1G1 = numFlag + prK1G1 + dbFlag;
	prK2 = numFlag + prK2 + dbFlag;
	prO1 = numFlag + prO1 + dbFlag;
	
    for (var i = 0; i < enrollKeys.length; i++) {
		var n = enrollKeys[i].n
		var s = enrollKeys[i].s;
		var n1 = n + 1;
		var n2 = n + 2;
		var n3 = n + 3;
		var n4 = n + 4;
		
        switch (enrollKeys[0].protocode) {
        case prK1K2:
            var k2 = enrollKeys[i].k2; //
            enrollKeys[i].g1 = engGetKey(n2, enrollKeys[i].s, k2, m, h); //
            var k3 = engGetKey(n3, s, p, m, h);
            var g2 = enrollKeys[i].g2 = engGetKey(n3, s, k3, m, h); //
            enrollKeys[i].o1 = engGetKey(n2, s, g2, m, h); //
            var k4 = engGetKey(n4, s, p, m, h);
            var g3 = engGetKey(n4, s, k4, m, h);
            enrollKeys[i].o2 = engGetKey(n3, s, g3, m, h); //
            break;
        case prG2O2:
            enrollKeys[i].n1 = n1; //
            enrollKeys[i].n2 = n2; //
            var g2 = enrollKeys[i].g2; //
            enrollKeys[i].k1 = engGetKey(n1, s, p, m, h); //
            var k2 = enrollKeys[i].k2 = engGetKey(n2, s, p, m, h); //
            enrollKeys[i].g1 = engGetKey(n2, s, k2, m, h); //
            enrollKeys[i].o1 = engGetKey(n2, s, g2, m, h); //
            break;
        case prK1G1:
            var k3 = engGetKey(n3, s, p, m, h);
            var g2 = engGetKey(n3, s, k3, m, h);
			enrollKeys[i].o1 = engGetKey(n2, s, g2, m, h); //
            break;
        case prK2:
            var k3 = engGetKey(n3, s, p, m, h);
            var k4 = engGetKey(n4, s, p, m, h);
            var g3 = engGetKey(n4, s, k4, m, h);
			enrollKeys[i].g2 = engGetKey(n3, s, k3, m, h); //
			enrollKeys[i].o2 = engGetKey(n3, s, g3, m, h); //
            break;
        case prO1:
            enrollKeys[i].n1 = n + 1;
            enrollKeys[i].k1 = engGetKey(enrollKeys[i].n1, s, p, m, h); //
            var k2 = engGetKey(n2, s, p, m, h);
            enrollKeys[i].g1 = engGetKey(n2, s, k2, m, h); //
            enrollKeys[i].o1; //
			break;
        default:
            break;
        }
    }
    return enrollKeys;
}
