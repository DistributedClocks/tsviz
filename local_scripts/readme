The files in this directory ($tsviz_home/local_scripts/) are prepended with
'loadX.' to ensure proper load order when minimizing TSViz. For example, d3 must
be loaded prior to its external extension d3-tip because d3-tip declarations
append definitions to the d3 object.

If you add a script that extends another script, ensure its 'loadX' prefix is
higher than its dependency's.

(Note: although almost every file in TSViz relies on d3 and jQuery, their
ordering does not matter because no functions and classes are merely defined
within the $tsvix_home/js directory, none are actually called until all files
are loaded and the page is ready.)
