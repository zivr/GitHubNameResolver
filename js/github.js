class GitHubSsoTranslator {
    constructor() {
        this._loadStorage();
    }

    translateUserSSO(sso) {
        if (this._users.hasOwnProperty(sso)) {
            return Promise.resolve(this._users[sso]);
        }
        if (isNaN(sso)){
            return Promise.reject();
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

    replaceUserSSOInTags(tags) {
        for (let i = 0, len = tags && tags.length; i < len; i++) {
            const tag = tags[i];
            if (tag.textContent) {
                let userSSO = tag.textContent.trim();
                if (isNaN(userSSO)){
                    userSSO = userSSO.substr(1); //remove @
                }
                this.translateUserSSO(userSSO).then((userName) => {
                    tag.textContent = '@' + userName;
                    tag.setAttribute('title', userSSO);
                }, () => {});
            }
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
    translator.replaceUserSSOInTags(authors);

    const mentions = document.getElementsByClassName('user-mention');
    translator.replaceUserSSOInTags(mentions);

    const issue = document.querySelectorAll('.issue-meta a.tooltipped');
    translator.replaceUserSSOInTags(issue);

    const openedBy = document.querySelectorAll('.issues-listing .opened-by a');
    translator.replaceUserSSOInTags(openedBy);

    const reviewer = Array.apply(null,document.querySelectorAll('.reviewers-status-icon'))
        .map((elem) => elem.parentElement.querySelector('.text-bold'));
    translator.replaceUserSSOInTags(reviewer);

    const assignees = document.querySelectorAll('.js-discussion-sidebar-item .assignee');
    translator.replaceUserSSOInTags(assignees);

    const discussion = document.querySelectorAll('.discussion-item-entity');
    translator.replaceUserSSOInTags(discussion);
};

chrome.runtime.onMessage.addListener((request) => {
    if (request.pageUpdated) {
        traslatePage();
        setTimeout(traslatePage, 1000); //translate again after few ajax are done
    }
});
document.addEventListener("DOMNodeInserted", Utils.debounce(traslatePage, 100), false);

traslatePage();










