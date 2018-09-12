#! /bin/bash

# A little script to comment a particuliar regex (POSIX Extended Regular Expressions) 
# in a directory, tree directory, file(s) or any comination. If no arguments are passed,
# will execute recursively from the script location.

# author: Guilhem HEINRICH
# email: guilhem.heinrich@inra.fr

REGEX_TO_COMMENT='^ *console\.log\(.*\);? *$'
COMMENTATOR='// '

correct_in_directory ()
{
    DIR="$1"
    # From <https://stackoverflow.com/questions/40558359/recursively-replace-a-string-while-safely-avoiding-git-directories>
    find "${DIR}" -type f -print0 | xargs -0 sed -E -i "s|${REGEX_TO_COMMENT}|${COMMENTATOR}&|g"
}

if [[ "$#" -ne 0 ]]; then
    echo "Got at least one parameter"
    for DIR_OR_FILE in "$@"
    do
            if [[ -d $DIR_OR_FILE ]]; then
                echo "DIRECTORY Correcting in ${DIR_OR_FILE}"
                correct_in_directory ${DIR_OR_FILE}
            else 
                echo "FILE Correcting in ${DIR_OR_FILE}"
                sed -E -i "s|${REGEX_TO_COMMENT}|${COMMENTATOR}&|g" ${$DIR_OR_FILE}
            fi
    done
    else
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
    correct_in_directory ${DIR}
fi


