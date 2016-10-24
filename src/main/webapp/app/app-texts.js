
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
            'FIELD_REFERENCES' : 'References',
            'FIELD_ATTACHMENTS' : 'Attachments',
            'FIELD_CHARTS' : 'Charts',
            'PART_TYPE_DETAILS' : 'Details',
            'PART_TYPE_TIME' : 'Time',
            'PART_TYPE_POSITIONS' : 'Positions',
            'PART_TYPE_NOTE' : 'Note',
            'PART_TYPE_PROHIBITION' : 'Prohibition',
            'PART_TYPE_SIGNALS' : 'Signals',
            'REF_REPETITION' : '(repetition)',
            'REF_CANCELLED' : '(cancelled)',
            'REF_UPDATED' : '(updated)',
            'ACTIVE_NOW' : 'Active Now',
            'SHOW_ATTACHMENTS' : 'Show attachments',
            'HIDE_ATTACHMENTS' : 'Hide attachments'
        });

        $translateProvider.translations('da', {

            'MENU_DETAILS' : 'Detaljer',
            'MENU_MAP' : 'Kort',
            'MENU_PDF' : 'PDF',
            'MENU_NW'  : 'Navigationsadvarsler',
            'MENU_NM'  : 'Efterretninger til søfarende',
            'BTN_CLOSE' : 'Luk',
            'GENERAL_MSGS' : 'Generelle Meddelelser',
            'FIELD_REFERENCES' : 'Referencer',
            'FIELD_ATTACHMENTS' : 'Vedhæftninger',
            'FIELD_CHARTS' : 'Søkort',
            'PART_TYPE_DETAILS' : 'Detaljer',
            'PART_TYPE_TIME' : 'Tid',
            'PART_TYPE_POSITIONS' : 'Positioner',
            'PART_TYPE_NOTE' : 'Note',
            'PART_TYPE_PROHIBITION' : 'Forbud',
            'PART_TYPE_SIGNALS' : 'Skydesignaler',
            'REF_REPETITION' : '(gentagelse)',
            'REF_CANCELLED' : '(udgår)',
            'REF_UPDATED' : '(ajourført)',
            'ACTIVE_NOW' : 'Aktive nu',
            'SHOW_ATTACHMENTS' : 'Vis vedhæftninger',
            'HIDE_ATTACHMENTS' : 'Skjul vedhæftninger'
        });

        $translateProvider.preferredLanguage('en');

    }]);

