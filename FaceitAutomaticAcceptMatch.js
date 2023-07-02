// ==UserScript==
// @name         Faceit: Automatic Accept Match
// @namespace    https://github.com/wilianwrech/FaceitAutomaticAcceptMatch
// @version      1.0
// @description  Automatic accepts new matches and automatic connects to the server.
// @author       Wilian Webber Rech
// @match        https://www.faceit.com/*
// @icon         https://www.faceit.com/favicon.ico
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function($) {
    'use strict'

    const APP_NAME = 'FAAM'
    const GREEN = '#2bac76'
    const YELLOW = '#ac7f2b'
    const RED = '#ac3e2b'
    const protoConsole = {
        _socketId: '',
        _console: window.console || false,
        _doLog(level, color, ...args) {
            this._console && this._console[level](`%c${APP_NAME}:`, `color: ${color}`, ...args)
        },
        log(...args) {
            this._doLog('log', GREEN, ...args)
        },
        info(...args) {
            this._doLog('info', GREEN, ...args)
        },
        error(...args) {
            this._doLog('error', RED, ...args)
        },
        debug(...args) {
            this._doLog('debug', YELLOW, ...args)
        }
    };
    const console = Object.assign({}, protoConsole, {_socketId: ''})

    if (!$) {
        console.error('jQuery is not loaded')
        return
    }

    if (window.location.hostname.indexOf('faceit.com') == -1) {
        console.error('This script only works on faceit.com')
        return
    }

    try {
        console.log('Faceit: Automatic Accept Match - Running')

        const ACCEPT_CONTAINER_SELECTOR = '.FuseModalPortal'
        const CONNECT_CONTAINER_SELECTOR = '#parasite-container'
        const ACCEPT_LABELS = ['accept', 'aceitar']
        const CONNECT_LABELS = ['connect', 'conectar']

        const middleClick = new MouseEvent('click', { 'button': 1, 'which': 2 });

        const getButton = (labels) => {
            const $containers = $($(CONNECT_CONTAINER_SELECTOR).add(ACCEPT_CONTAINER_SELECTOR).filter(':not(:empty)').map((i, el) => el.shadowRoot ?? el).toArray());
            return $containers.find('a, button').filter((i, el) => {
                const label = $(el).text().trim().toLocaleLowerCase()
                return label && labels.includes(label)
            })[0];
        }

        let mustConnected = false
        console.log('Starting interval')
        setInterval(() => {
            try {
                console.log(`Looking for ${mustConnected ? 'connect' : 'accept'} button`)

                const $acceptBtn = getButton(ACCEPT_LABELS);
                if ($acceptBtn) {
                    console.debug('Accept button found', $acceptBtn)
                    $acceptBtn.click()
                    console.debug('Accept click successfully performed')
                    console.log('Match Accepted')
                    mustConnected = true
                }

                if (mustConnected) {
                    const $connectBtn = getButton(CONNECT_LABELS)
                    if ($connectBtn) {
                        console.debug('Connect button found', $connectBtn)
                        const matchLink = $connectBtn.getAttribute('href')
                        console.debug(`Match link: ${matchLink}`)
                        $connectBtn.dispatchEvent(middleClick)?.length
                        console.debug('Connect click successfully performed')
                        window.open(matchLink, '_blank')
                        console.debug('Successfully created new tab for match link')
                        console.log('Connecting to server')
                        mustConnected = false
                    }
                }
            } catch (e) {
                console.error('Error', e);
            }
        }, 5000)
    } catch (e) {
        console.error('Faceit: Automatic Accept Match failed to start', e);
    }
})(jQuery);