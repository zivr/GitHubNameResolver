class GitHubSsoTranslator {
    constructor() {
        this._loadStorage();
    }

    translateUserSSO(sso) {
        if (this._users.hasOwnProperty(sso)) {
            return Promise.resolve(this._users[sso]);
        }
        return PromisifyedXmlHttpRequest.get('https://github.build.ge.com/' + sso)
            .then((data) => {
                let matchArr = data.match('<title>' + sso + '.\(.*\)<', 'ig');
                if (matchArr && matchArr.length === 2) {
                    const name = matchArr[1];
                    return name.substr(1, name.length - 2);
                }
                return Promise.reject('Unknown data format');
            }).then((userName) => {
                this._users[sso] = userName;
                this._updateStorage();
                return userName;
            });
    }

    replaceUserSSOInATags(aTags) {
        for (let i = 0, len = aTags && aTags.length; i < len; i++) {
            const tag = aTags[i];
            let userSSO = tag.text.trim(tag.text);
            if (isNaN(userSSO)){
                userSSO = userSSO.substr(1); //remove @
            }
            this.translateUserSSO(userSSO).then((userName) => {
                tag.text = '@' + userName;
                tag.setAttribute('title', userSSO);
            });
        }
    }

    _loadStorage() {
        const jsonStr = localStorage.getItem('ssoUserList');
        if (jsonStr) {
            this._users = JSON.parse(jsonStr);
        } else {
            this._users = {};
        }
    }

    _updateStorage() {
        localStorage.setItem('ssoUserList', JSON.stringify(this._users));
    }
}


const translator = new GitHubSsoTranslator();
const traslatePage = () => {
    const authors = document.querySelectorAll('a.author');
    translator.replaceUserSSOInATags(authors);

    const mentions = document.getElementsByClassName('user-mention');
    translator.replaceUserSSOInATags(mentions);

    const issue = document.querySelectorAll('.issue-meta a.tooltipped');
    translator.replaceUserSSOInATags(issue);
};

chrome.runtime.onMessage.addListener((request) => {
    if (request.pageUpdated) {
        traslatePage();
    }
});
traslatePage();






