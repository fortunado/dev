// Hasq Technology Pty Ltd (C) 2013-2016
function engGetTokenInfo(data, rawS, s) {
	var response = engGetResponse(data);
	
	var item = {};
    item.rawS = rawS;
    item.s = s;
    item.avail = false;
	item.unavail = false;
	
	if (response.message === 'OK') {
        var lr = engGetResponseLast(data);
        var nr = engGetNewRecord(lr.n, lr.s, glPassword, null, null, glCurrentDB.magic, glCurrentDB.hash);
        item.n = lr.n;
        item.d = lr.d;
        item.avail = false;
		item.unavail = false;
		
        switch (engGetTokensState(lr, nr)) {
        case 1:
            item.message = 'OK';
			item.avail = true;
            break;
        case 2:
            item.message = 'TKN_SNDNG';
			item.unavail = true;
            break;
        case 3:
            item.message = 'TKN_RCVNG';
			item.unavail = true;
            break;
        default:
            item.message = 'WRONG_PWD';
			item.unavail = true;
            break;
        }
    } else {
		item.message = 'IDX_NODN';
		item.unavail = true;
		item.n = -1;	
		item.d = '';		
	}

    return item;
}

function engGetVTL(list, item) {
	if (arguments.length == 1) {
		// clear list
		list.items.length = 0;
		list.avail = false;
		list.unavail = false;
		return list;
	}
		
    var n = list.items.length;
    list.items[n] = {};
    list.items[n].rawS = item.rawS;
    list.items[n].s = item.s;
	list.items[n].n = item.n;
    list.items[n].d = item.d;
	list.items[n].message = item.message;
	
    if (item.avail === true) list.avail = true;
	if (item.unavail === true) list.unavail = true;

	return list;
	
}


function engGetVTLContent(list) {
	// checks content of the VTL (verified tokens list) for known and unknown tokens
    if (list.avail === true && list.unavail === false) {
        return true; //only known tokens;
    } 
	if (list.avail === false && list.unavail === true) {
        return false; //only unknown tokens
    }
	if (list.avail === true && list.unavail === true) {
        return undefined; //different tokens
    }	
	
	return null; //no has tokens

}


function engRunCL(commandsList, cbFunc) {
    var cb = function (ajxData) {
        if (commandsList.items.length == 0 && commandsList.idx >= commandsList.items.length) {
            return;
        }

        var progress = 100 * (commandsList.idx + 1) / commandsList.items.length;
        var r = engGetResponse(ajxData).message;

        if (r == 'OK' || r == 'IDX_NODN') {
            cbFunc(ajxData, commandsList.idx, progress);
            commandsList.idx++;
            commandsList.counter = 100;
        } else {
			console.log('err ' + commandsList.counter);
            commandsList.counter--;
            if (commandsList.counter == 0) { //if (commandsList.counter < 0) {
				commandsList.idx++; // upd
				commandsList.counter = 100; // upd
                cbFunc(ajxData, commandsList.idx, progress);
                //commandsList.items.length = 0;
            }
        }

        if (commandsList.items.length != 0 && commandsList.idx < commandsList.items.length) {
            engRunCL(commandsList, cbFunc)
        }
    }

    if (commandsList.items.length > 0 && commandsList.idx < commandsList.items.length) {
        ajxSendCommand(commandsList.items[commandsList.idx].cmd, cb, hasqdLed);
    } else if (commandsList.items.length === 0) {
        cbFunc('OK', 0, 0);
    }
}
