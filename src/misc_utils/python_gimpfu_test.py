#!/usr/bin/env python

# Sample Shell Rel 1
# Created by Trissolo
# Comments directed to http://gimpchat.com or http://gimpscripts.com
#
# License: GPLv3
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY# without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# To view a copy of the GNU General Public License
# visit: http://www.gnu.org/licenses/gpl.html
#
#
# ------------
#| Change Log |
# ------------
# Rel 1: Initial release.
import math
import string
#import Image
#from array import array
from gimpfu import *

import json


def showMessage(string):
   
    # return string 
    return pdb.gimp_message("\n" + string)


def arrayFromVector(vector):
	x_and_y_values = []
	bezier_list = vector.strokes[0].points[0]
	
	for i in range(0, len(bezier_list), 6):
		x_and_y_values.append(int(bezier_list[i]))
		x_and_y_values.append(int(bezier_list[i + 1]))
  
	return x_and_y_values


def test_json_mess(image, layer, x_blur = 9, mybool = True ,x1 =0 ,infilename =  "", source_directory="", res = "", container = {}) :
	pdb.gimp_image_undo_group_start(image)
	pdb.gimp_context_push()
	
	pdb.gimp_message("This is sample shell script.")
	showMessage(str(mybool))
	#PUT YOUR CODE HERE

	qqq = {"gag": arrayFromVector(image.vectors[0])}
	res = json.dumps(qqq)#, indent= 2)

	showMessage(res)
	'''
	for idx, vector in enumerate(image.vectors):
	  x_and_y_values = []
	  bezier_list = vector.strokes[0].points[0]
    
    for i in range(0, len(bezier_list), 6):
      x_and_y_values.append( int(bezier_list[i]) )
      x_and_y_values.append( int(bezier_list[i + 1]) )
    
    
  
  #pdb.gimp_message(res)
  '''
	#no more code!
	pdb.gimp_context_pop()
	pdb.gimp_image_undo_group_end(image)
	pdb.gimp_displays_flush()
    #return

register(
	"python_fu_json_poligons",                           
	"Doh! Just a sample script does nothing just a template",
	"Just a sample script does nothing just a template",
	"Trissolo",
	"Trissolo",
	"2014",
	"<Image>/Windows/Generate JSON (Polygons)",             #Menu path
	"RGB*, GRAY*", 
	[(PF_INT, "x_blur", "X Blur", 9),
	#(PF_COLOR, "oldcolor",  "Replace Color:",  (43,198,255)),
	(PF_BOOL, "mybool",  "True or Not?",  True),
	(PF_SPINNER, "x1", "x1:", 0, (0, 100, 0.5))
	#(PF_SPINNER, "y1", "y1:", 100, (0, 100, 0.5)),
	#(PF_SPINNER, "x2", "x2:", 100, (0, 100, 0.5)),
	#(PF_SPINNER, "y2", "y2:", 0, (0, 100, 0.5)),
	#(PF_COLOR, "black",  "Black point color",  (0,0,0) PF_FILE, "infilename", "Temp Filepath", "/Default/Path"),
	#(PF_COLOR, "white",  "White point color",  (255,255,255) ),
	#(PF_COLOR, "gray",  "Gray point color",  (128,128,128) )
	#(PF_FILE, "infilename", "Temp Filepath", "/Default/Path")#,
	#(PF_DIRNAME, "source_directory", "Source Directory", "")# for some reason, on my computer when i(Tin) use PF_DIRNAME the pythonw.exe would crash
	],
	[],
	test_json_mess)

main()
