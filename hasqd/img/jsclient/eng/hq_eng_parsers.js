// Hasq Technology Pty Ltd (C) 2013-2016

function engGetResponseHeaderInfoId(data)
{
    // returns response header
    var err = {};
    var infoId = data.replace(/^OK/g,'').replace(/^\s+|\r|\s+$/g, '');
    var lines = infoId.split(/\n/);

    if (lines.length < 5)
    {
        err.msg = 'ERROR';
        err.cnt = 'NO_OUTPUT';
        return err;
    }

    return infoId;
}

function engGetResponseHeaderInfoSys(data)
{
    var err = {};
    var infoSys = data.replace(/^OK/g,'').replace(/^\s+|\r|\s+$/g, '');
    var lines = infoSys.split(/\n/);

    if (lines.length < 5)
    {
        err.msg = 'ERROR';
        err.cnt = 'NO_OUTPUT';
        return err;
    }

    return infoSys;
}

function engGetResponseHeaderRange(data)
{
    var err = {};
    var range = data.replace(/^OK/g,'').replace(/^\s+|\r|\s+$/g, '');

    if (range.length == 0)
    {
        err.msg = 'ERROR';
        err.cnt = range;
        return err;
    }

    return range;
}

function engGetResponseHeaderInfoFam(data)
{
    var err = {};
    list = [];


    var infoFam = data.replace(/^OK/g,'').replace(/^\s+|\r|\s+$/g, '');
    if (infoFam.length == 0) return list;

    var lines = rawFamData.split(/\n/);

    for (var i = 0; i < lines.length; i++)
    {
        var parts = lines[i].split(/\s/);
        if (parts.length != 5) break;

        list[i] = {};
        list[i].name = parts[0];
        list[i].link = parts[1];
        list[i].neighbor = (parts[2] == 'N');
        list[i].alive = (parts[3] == 'A');
        list[i].unlock = (parts[4] == 'U');
    }

    return list;
}

function engGetOnlyNumber(data)
{
    return (data.replace(/[^0-9]/g, '').length > 0) ? +data.replace(/[^0-9]/g, '') : '';
}

function engIsNull(data)
{
    return (data === null) ? true : false;
}

function engIsRawTokens(data, hash)
{
    var n = data;
    n = n.replace(/^\s+|\s+$/g, ''); // remove all space-like symbols from the start and end of the string
    n = n.split(/\s/);
    for (var i = 0; i < n.length; i++)
    {
        n[i] = n[i].replace(/^\s+|\s+$/g, '');
        if ((n[i].length == 0) || (n[i] === undefined) || (n[i] === null))
        {
            true;
        }
        else if (n[i].charAt(0) == '[' && n[i].charAt(n[i].length - 1) == ']' && n[i].length > 2)
        {
            if (/\[|\]/.test(n[i].substring(1, n[i].length - 1)))
            {
                return false;
            }
            else
            {
                true;
            }
        }
        else if (engIsHash(n[i], hash))
        {
            true;
        }
        else
        {
            return false;
        }
    }
    return true;
}

function engGetOrderedTokens(tok)
{
    // sorts tokens list by names and hashes;

    tok.sort(engSortByProperties('s'));

    for (var i = 0; i < tok.length - 1; i++)
    {
        if (tok[i].s == tok[i + 1].s && tok[i].r == tok[i + 1].r)
        {
            tok.splice(i + 1, 1);
            i--;
        }
        else if (tok[i].s == tok[i + 1].s && tok[i].r != tok[i + 1].r && tok[i].r == '')
        {
            tok[i].r = tok[i + 1].r;
            tok.splice(i + 1, 1);
            i--;
        }
        else if (tok[i].s == tok[i + 1].s && tok[i].r != tok[i + 1].r && tok[i + 1].r == '')
        {
            tok.splice(i + 1, 1);
            i--;
        }
    }
    return tok;
}

function engGetTokens(rawTok, hash)
{
    // returns parsed tokens list with names and hashes;
    var tok = [];
    rawTok = rawTok.replace(/^\s+|\s+$/g, '').split(/\s/);; // remove all space-like symbols from the start and end of the string

    for (var i = 0; i < rawTok.length; i++)
    {
        rawTok[i] = rawTok[i].replace(/^\s+|\s+$/g, '');
        if ((rawTok[i].length == 0) || (rawTok[i] === undefined) || (rawTok[i] === null))
        {
            rawTok.splice(i, 1);
            i--;
        }
        else if (rawTok[i].charAt(0) == '[' && rawTok[i].charAt(rawTok[i].length - 1) == ']' && rawTok[i].length > 2)
        {
            var l = tok.length;
            tok[l] = {};
            tok[l].r = rawTok[i].slice(1, -1);
            tok[l].s = engGetHash(tok[l].r, hash);
        }
        else if (engIsHash(rawTok[i], hash))
        {
            var l = tok.length;
            tok[l] = {};
            tok[l].r = '';
            tok[l].s = rawTok[i];
        }
    }

    return engGetOrderedTokens(tok);
}

function engGetRawTokensList(data)
{
    // if exists raw token names returns its otherwise hash;
    var r = [];

    for (var i = 0; i < data.length; i++)
    {
        r[i] = (data[i].r != '') ? data[i].r : data[i].s;
    }

    return r;
}

function engGetParsedAcceptKeys(rawKeys)
{
    var prK1K2 = '23132';
    var prG2O2 = '24252';
    var prK1G1 = '23141';
    var prK2 = '232';
    var prO1 = '251';

    var acceptKeys = [];

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

    for (var i = 0; i < keys.length; i++)
    {
        //      FIXME what is this code?
        //      keys[i] = keys[i].replace(/^\s+|\s+$/, '');
        //      if ((keys[i] === undefined) || (keys[i] === null) || (keys[i].length == 0))
        //      {
        //          keys.splice(i, 1);
        //          i--;
        //          break;
        //      }

        var el = keys[i].split(/\s/);

        acceptKeys[i] = {};
        acceptKeys[i].prcode = prCode;
        acceptKeys[i].n = (coef == 1) ? acceptKeys[i].n = -1 : acceptKeys[i].n = +el[0];// if protocol have record numbers n = -1;
        acceptKeys[i].s = el[1 - coef];

        switch (prCode)
        {
            case (prK1K2):
                acceptKeys[i].k1 = el[2 - coef];
                acceptKeys[i].k2 = el[3 - coef];
                break;
            case (prG2O2):
                acceptKeys[i].g2 = el[2 - coef];
                acceptKeys[i].o2 = el[3 - coef];
                break;
            case (prK1G1):
                acceptKeys[i].k1 = el[2 - coef];
                acceptKeys[i].g1 = el[3 - coef];
                break;
            case (prK2):
                acceptKeys[i].k2 = el[2 - coef];
                break;
            case (prO1):
                acceptKeys[i].o1 = el[2 - coef];
                break;
            default:
                    break;
        }
    }

    acceptKeys.sort(engSortByProperties('s'));

    // if presents keys for same token;
    for (var i = 0; i < acceptKeys.length - 1; i++)
    {
        if (acceptKeys[i].s == acceptKeys[i + 1].s)
        {
            acceptKeys.splice(i + 1, 1);
            i--;
        }
    }

    return acceptKeys;
}

function engGetTitleRecord(acceptKeys, p, h, m)
{
    var titleRecord = acceptKeys;
    var prK1K2 = '23132';
    var prG2O2 = '24252';
    var prK1G1 = '23141';
    var prK2 = '232';
    var prO1 = '251';

    var prCode = acceptKeys[0].prcode; // get protocol key from first element;
    var numFlag = prCode.charAt(0);
    var dbFlag = (prCode.charAt(prCode.length - 1) == '0') ? '0' : '';
    var coef = (numFlag == '0') ? 1 : 0; // if protocol have record numbers;

    prK1K2 = numFlag + prK1K2 + dbFlag;
    prG2O2 = numFlag + prG2O2 + dbFlag;
    prK1G1 = numFlag + prK1G1 + dbFlag;
    prK2 = numFlag + prK2 + dbFlag;
    prO1 = numFlag + prO1 + dbFlag;

    for (var i = 0; i < titleRecord.length; i++)
    {
        var n = titleRecord[i].n;
        var s = titleRecord[i].s;
        var n1 = n + 1;
        var n2 = n + 2;
        var n3 = n + 3;
        var n4 = n + 4;

        switch (titleRecord[0].prcode)
        {
            case prK1K2:
                var k2 = titleRecord[i].k2; //
                titleRecord[i].g1 = engGetKey(n2, titleRecord[i].s, k2, m, h); //
                var k3 = engGetKey(n3, s, p, m, h);
            var g2 = titleRecord[i].g2 = engGetKey(n3, s, k3, m, h); //
                titleRecord[i].o1 = engGetKey(n2, s, g2, m, h); //
                var k4 = engGetKey(n4, s, p, m, h);
                var g3 = engGetKey(n4, s, k4, m, h);
                titleRecord[i].o2 = engGetKey(n3, s, g3, m, h); //
                break;
            case prG2O2:
                titleRecord[i].n1 = n1; //
                titleRecord[i].n2 = n2; //
                var g2 = titleRecord[i].g2; //
                titleRecord[i].k1 = engGetKey(n1, s, p, m, h); //
                var k2 = titleRecord[i].k2 = engGetKey(n2, s, p, m, h); //
                titleRecord[i].g1 = engGetKey(n2, s, k2, m, h); //
                titleRecord[i].o1 = engGetKey(n2, s, g2, m, h); //
                break;
            case prK1G1:
                var k3 = engGetKey(n3, s, p, m, h);
                var g2 = engGetKey(n3, s, k3, m, h);
                titleRecord[i].o1 = engGetKey(n2, s, g2, m, h); //
                break;
            case prK2:
                var k3 = engGetKey(n3, s, p, m, h);
                var k4 = engGetKey(n4, s, p, m, h);
                var g3 = engGetKey(n4, s, k4, m, h);
                titleRecord[i].g2 = engGetKey(n3, s, k3, m, h); //
                titleRecord[i].o2 = engGetKey(n3, s, g3, m, h); //
                break;
            case prO1:
                titleRecord[i].n1 = n + 1;
                titleRecord[i].k1 = engGetKey(titleRecord[i].n1, s, p, m, h); //
                var k2 = engGetKey(n2, s, p, m, h);
                titleRecord[i].g1 = engGetKey(n2, s, k2, m, h); //
                titleRecord[i].o1; //
                break;
            default:
                    break;
        }
    }
    return titleRecord;
}
