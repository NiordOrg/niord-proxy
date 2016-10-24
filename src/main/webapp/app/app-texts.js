
/**
 * Translations.
 */
angular.module('niord.proxy.app')

    .config(['$translateProvider', function ($translateProvider) {

        $translateProvider.translations('en', {

            'MENU_DETAILS' : 'Details',
            'MENU_MAP' : 'Map',
            'MENU_PDF' : 'PDF',
            'MENU_NW'  : 'Navigational Warnings',
            'MENU_NM'  : 'Notices to Mariners',
            'BTN_CLOSE' : 'Close',
            'GENERAL_MSGS' : 'General Messages',
            'FIELD_REFERENCE' : 'Reference',
            'FIELD_TIME' : 'Time',
            'FIELD_LOCATION' : 'Location',
            'FIELD_DETAILS' : 'Details',
            'FIELD_ATTACHMENTS' : 'Attachments',
            'FIELD_NOTE' : 'Note',
            'FIELD_CHARTS' : 'Charts',
            'FIELD_PUBLICATION' : 'Publication',
            'REF_REPETITION' : '(repetition)',
            'REF_CANCELLED' : '(cancelled)',
            'REF_UPDATED' : '(updated)',
            'ACTIVE_NOW' : 'Active Now',
            'SHOW_POS' : 'Show positions',
            'HIDE_POS' : 'Hide positions'
        });

        $translateProvider.translations('da', {

            'MENU_DETAILS' : 'Detaljer',
            'MENU_MAP' : 'Kort',
            'MENU_PDF' : 'PDF',
            'MENU_NW'  : 'Navigationsadvarsler',
            'MENU_NM'  : 'Efterretninger til søfarende',
            'BTN_CLOSE' : 'Luk',
            'GENERAL_MSGS' : 'Generelle Meddelelser',
            'FIELD_REFERENCE' : 'Reference',
            'FIELD_TIME' : 'Tid',
            'FIELD_LOCATION' : 'Placering',
            'FIELD_DETAILS' : 'Detaljer',
            'FIELD_ATTACHMENTS' : 'Vedhæftninger',
            'FIELD_NOTE' : 'Note',
            'FIELD_CHARTS' : 'Søkort',
            'FIELD_PUBLICATION' : 'Publikation',
            'REF_REPETITION' : '(gentagelse)',
            'REF_CANCELLED' : '(udgår)',
            'REF_UPDATED' : '(ajourført)',
            'ACTIVE_NOW' : 'Aktive nu',
            'SHOW_POS' : 'Vis positioner',
            'HIDE_POS' : 'Skjul positioner'
        });

        $translateProvider.preferredLanguage('en');

    }]);

