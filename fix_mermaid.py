#! /usr/bin/python2.7
# From https://stackoverflow.com/questions/2433648/match-multiline-regex-in-file-object

import numpy as np
import re
import os
import sys


current_directory = sys.path[0]
path_to_mermaid = '/node_modules/mermaid/dist/mermaid.core.js'
print(current_directory)
# Open file as file object and read to string
ifile = open(current_directory + path_to_mermaid,'r')

# Read file object to string
text = ifile.read()

# Close file object
ifile.close()

# Regex pattern
regex = r"""(.*
^var render = function render\(id, txt, cb, container\) \{)
(.*)
(^.*window\.txt = txt;
^.*txt = encodeEntities\(txt\);
.*)
"""

# Correctif
fix = """  if (typeof container !== 'undefined') {
    container.innerHTML = '';
    d3.select(container).append('div').attr('id', 'd' + id) ;
} else {
    var _element = document.querySelector('#' + 'd' + id);
    if (_element) {
        _element.innerHTML = '';
    }
    d3.select('body').append('div').attr('id', 'd' + id);
  }
"""

match = re.search(regex, text, re.MULTILINE | re.DOTALL)
if (match):
    print('Correction from position ' + str(match.start(2)) + ' to position ' + str(match.end(2)))
    output = match.group(1) + fix + match.group(3)
    mermaid_file = open(current_directory + path_to_mermaid,"w")
    mermaid_file.write(output)
    mermaid_file.close()
    # print output



