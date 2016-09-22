#!/usr/bin/env python
import ts_lib

OK = "OK"
IDX_NODN = "IDX_NODN"
JOB_QUEUED = "JOB_QUEUED"

def get_msg(*data):
    msg = {
        "f_chd" : "Text content has been cleared in file",
        "f_emp" : "File contains nothing: ",
        "f_err" : "Couldn't read file: ",
        "j_err" : "Incorrect job id",
        "j_id" : "(Job id)",
        "h_pwd" : "[password|-]",
        "h_tok" : "(token name|@file)",
        "k_emp" : "Master key is empty.",
        "k_ent" : "Enter master key:",
        "m_err" : "ERROR:",
        "m_usg" : "Usage: python",
        "m_wrn" : "WARNING:",
        "s_err" : "Server is unreachable:",
        "s_rep" : "Server reply:",
        "f_mis" : "File is empty or missing: ",
        "t_bin" : "Token name seems binary; please use file instead",
        "s_dn0" : "No such token",
        "s_dn1" : "Token exists",
        "p_bad" : "Password Bad",
        "p_ok" : "Password Ok",
        "p_snd" : "Onhold sending",
        "p_rcv" : "Onhold receiving",
        "d_no" : "No data",
    }
    
    r = ""    
    for i in range(len(data)):
        p = str(data[i]) if msg.get(data[i]) == None else msg[data[i]]
        r = ts_lib.get_spaced_concat(r, p)
        
    return r