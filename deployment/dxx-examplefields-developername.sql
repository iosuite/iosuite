-- This is an example file for deploying field/record changes from environment to environment

-- File naming:
-- The file name structure is as follows

-- 1st character is either "d" or "x". "d" lists the changes as moved to [d]evelopment only, "x" means they have not been moved
-- 2nd character is either "s" or "x". "s" lists the changes as moved to [s]taging, "x" means they have not been moved
-- 3rd characters is either "p" or "x". "p" lists the changes as moved to [p]roduction, "x" means they have not been moved

CREATE RECORD `_test_record` (
	recordname `recordname`,
	owner `123`,
	description `This is a description`,
	includename true,
	showid false,
	showcreationdate false,
	showcreationdateonlist false,
	showowner false,
	showowneronlist false,
	showownerallowchange false, -- requires showowner to be set to true
	accesstype 'CUSTRECORDENTRYPERM', -- USEPERMISSIONLIST, NONENEEDED
	allowuiaccess true,
	allowmobileaccess false,
	allowattachments true,
	shownotes true,
	enablemailmerge false,
	isordered false,
	allowinlinedetaching true,
	allowinlineediting false, -- Requires allowinlinedetaching to be set to true
	allowinlinedeleting false, -- Requires allowinlineediting to be set to true
	allowquicksearch false,
	allowquickadd true,
	enablesystemnotes true,
	enablekeywords true,
	includeinsearchmenu true,
	enableoptimisticlocking true,
	enabledle true,
	isinactive false
);