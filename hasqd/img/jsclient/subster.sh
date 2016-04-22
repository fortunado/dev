#!/bin/bash

error() {
    [ -z "$1" ] || echo "$1" >&2
    exit 1
}

while read -r LINE; do
    if [ "$LINE" = "INCLUDEFILE" ]; then
        read LINE
        [ -r "$LINE" ] || error "cant open file $LINE"
            while read -r SLINE; do
                slashn="\\n";
                echo "r += '$SLINE$slashn';"
            done < "$LINE"
        continue
    fi
    echo "$LINE"
done
