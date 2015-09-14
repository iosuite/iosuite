# Thanks Coderwall, Laura Davis-Robeson, https://coderwall.com/p/oooszg/vagrant-tweaks-to-make-it-more-like-your-local-command-line-app
# setup +VqDZ4Y1Qg1Mx7J7z94L iosuite

#########################
# Git
#########################
# Show present working directory and Git branch at prompt
# source: http://www.developerzen.com/2011/01/10/show-the-current-git-branch-in-your-command-prompt/
function parse_git_branch () {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}


# aliases
alias g="git"
alias ga="git add"
alias gb="git branch"
alias gc="git commit"
alias gco="git checkout"
alias gcol="git checkout live"
alias gcom="git checkout master"
alias gcos="git checkout stable"
alias gd="git diff"
alias gl="git lg"
alias gm="git merge"
alias gp="git pull --ff"
alias gpol="git push origin live"
alias gpom="git push origin master"
alias gpos="git push origin stable"
alias gs="git status"

# ANSI colors: http://www.tldp.org/HOWTO/Bash-Prompt-HOWTO/x329.html
RED="\[\033[0;31m\]"
YELLOW="\[\033[0;33m\]"
GREEN="\[\033[0;32m\]"
PURPLE="\[\033[0;35m\]"
LIGHT_GREY="\[\033[0;37m\]"
DARK_GREY="\[\033[1;30m\]"
NO_COLOUR="\[\033[0m\]"

# prompt config:
PS1="\[\033[0;31m\]VAGRANT $LIGHT_GREY\w$PURPLE\$(parse_git_branch)$NO_COLOUR\$ "

#########################
# Drush commands
#########################
alias d="drush"
alias dca="drush cc all"
alias dcssagg-on="vset preprocess_css 1 --yes"
alias dcssagg-off="vset preprocess_css 0 --yes"


#########################
# Misc
#########################
alias ls="ls -l"

#########################
# CD BACKSLASH SHORTHAND
#########################
alias ..='cd ../'
alias ...='cd ../../'
alias ....='cd ../../../'
alias .....='cd ../../../../'

#########################
# NGROK
#########################
alias ngrok='/usr/lib/ngrok'

function setup() {

	authToken=$1
	subdomain=$2

	echo "Setting up the server."
	echo "once complete you can run these commands:"
	echo "'start': Start the server using pm2 and ngrok, accessable via https://$subdomain.ngrok.io"
	echo "'stop': Stop the server, breaks the tunnel and stops the pm2 server"
	
	export SUBDOMAIN=$subdomain
	mkdir ~/.ngrok2
	echo "auth_token: $authToken" >> ~/.ngrok
	echo "authtoken: $authToken" >> ~/.ngrok2/ngrok.yml
	pkill ngrok

}


function start() {

	[ -z "$SUBDOMAIN" ] && { echo "First time? Don't forget to run 'setup [authtoken] [subdomain].'"; return; }
	currentPath=$(pwd)
	cd /var/www/iosuite
	pm2 start iosuite.js > /dev/null
	eval "ngrok http -subdomain=$SUBDOMAIN 8080 > /var/www/iosuite/ngrok.log &"
	cd "$currentPath"

	echo "*************************************************"
	echo "*************************************************"
	echo "*****                                       *****"
	echo "*****     (_)               (_) |           *****"
	echo "*****      _  ___  ___ _   _ _| |_ ___      *****"
	echo "*****     | |/   \/ __| | | | | __/ _ \     *****"
	echo "*****     | | (_) \__ \ |_| | | ||  __/     *****"
	echo "*****     |_|\___/|___/\__,_|_|\__\___|     *****"
	echo "*****                         framework     *****"
	echo "*************************************************"
	echo "*************************************************"
	echo ""
	echo "Starting server, please wait"
	spinner 15
	echo "Server available at https://$SUBDOMAIN.ngrok.io"
}

function stop() {

	pm2 stop iosuite > /dev/null
	pkill ngrok > /dev/null

}

function spinner() {
    local seconds=$1
    icount=0
    local delay=.1
    local iterants=$((10*seconds))
    local spinstr='|/-\'
    while [[ $icount -le $iterants ]]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
        let icount+=1
    done
    printf "    \b\b\b\b"
}

# Go to public directory by default
# Go to the web root directory after logging in (note: your path may be different!):
cd /var/www/iosuite