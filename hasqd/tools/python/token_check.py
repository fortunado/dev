#!/usr/bin/python


# token_check (name|@file) [password|-]
# - ask for password
# reply
# 1 status tokena exists or not
# 2 ownership, only if password provided
# 3 data

# 1 Token exists | No token
# 2 Password OK | Password Bad | Onhold sending | Onhold receiving
# 3 No data
# ===========
# my data
# ===========

import sys
import urllib2
import getpass
import ts_lib
import ts_cnf
import ts_msg

CMD = 'last'
argv_len = len(sys.argv)

if argv_len == len(sys.argv) < 3:
    msg = ts_msg.get_msg('m_usg', sys.argv[0], 'h_tok', 'h_pwd')
    print msg
    quit()

msg = ""
if sys.argv[1][0] == '@':
    file_name = sys.argv[1][1:]
    dn_or_raw = ts_lib.get_data_from_file(file_name)

    if dn_or_raw["exitcode"] == 4: 
        msg = ts_msg.get_msg('m_err', 'f_err', file_name)
    if dn_or_raw["exitcode"] == 3: 
        msg = ts_msg.get_msg('m_err', 'f_mis', file_name)
    if dn_or_raw["exitcode"] == 2:
        msg = ts_msg.get_msg('m_err', 'f_emp', file_name)
    if dn_or_raw["exitcode"] == 1:
        msg = ts_msg.get_msg('m_wrn', 'f_chd', file_name)
    
    if msg != "" : print(msg)
    if dn_or_raw["exitcode"] > 1: quit()
else:
    dn_or_raw = ts_lib.get_tok_from_cmdline(sys.argv[1])
    
    if dn_or_raw["exitcode"] != 0: 
        msg = ts_msg.get_msg('m_err', 't_bin')
        print msg
        quit()

token = ts_lib.get_token_obj(dn_or_raw["data"], ts_cnf.HASH_NAME)
master_key = (sys.argv[2] if sys.argv[2] != '-'
               else getpass.getpass(ts_msg.get_msg('k_ent')))

if master_key == '':
    msg = ts_msg.get_msg('m_err', 'k_emp')
    print msg
    quit()

http_rqst = ts_lib.get_spaced_concat(CMD, ts_cnf.DB, token["s"])

try:
    http_resp = urllib2.urlopen('http://{}:{}/{}'.format(ts_cnf.HOST,
                                ts_cnf.PORT, http_rqst)).read()
except:
    print ts_msg.get_msg('m_err', 's_err', ts_cnf.HOST, ts_cnf.PORT)
else:
    print ts_msg.get_msg('s_rep', http_resp)