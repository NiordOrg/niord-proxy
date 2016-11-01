
/**
 * Translations.
 */
angular.module('niord.proxy.app')

    .config(['$translateProvider', function ($translateProvider) {

        $translateProvider.translations('en', {

            'MENU_DETAILS' : 'Details',
            'MENU_MAP' : 'Map',
            'MENU_TABLE' : 'List',
            'MENU_PDF' : 'PDF',
            'MENU_NW'  : 'Navigational Warnings',
            'MENU_NM'  : 'Notices to Mariners',
            'BTN_CLOSE' : 'Close',
            'GENERAL_MSGS' : 'General Messages',
            'FIELD_REFERENCES' : 'References',
            'FIELD_ATTACHMENTS' : 'Attachments',
            'FIELD_CHARTS' : 'Charts',
            'FIELD_PUBLICATION' : 'Publication',
            'PART_TYPE_DETAILS' : 'Details',
            'PART_TYPE_TIME' : 'Time',
            'PART_TYPE_POSITIONS' : 'Positions',
            'PART_TYPE_NOTE' : 'Note',
            'PART_TYPE_PROHIBITION' : 'Prohibition',
            'PART_TYPE_SIGNALS' : 'Signals',
            'MAIN_TYPE_NW' : 'NW',
            'MAIN_TYPE_NM' : 'NM',
            'TYPE_TEMPORARY_NOTICE' : 'Temp.',
            'TYPE_PRELIMINARY_NOTICE' : 'Prelim.',
            'TYPE_PERMANENT_NOTICE' : 'Perm.',
            'TYPE_MISCELLANEOUS_NOTICE' : 'Misc.',
            'TYPE_LOCAL_WARNING' : 'Local',
            'TYPE_COASTAL_WARNING' : 'Coastal',
            'TYPE_SUBAREA_WARNING' : 'Subarea',
            'TYPE_NAVAREA_WARNING' : 'Navarea',
            'REF_REPETITION' : '(repetition)',
            'REF_CANCELLED' : '(cancelled)',
            'REF_UPDATED' : '(updated)',
            'ACTIVE_NOW' : 'Active Now',
            'SHOW_ATTACHMENTS' : 'Show attachments',
            'HIDE_ATTACHMENTS' : 'Hide attachments',
            'MSG_NOT_FOUND' : 'Message {{messageId}} not found',
            'MORE_MSGS' : ' and {{messageNo}} more messages'
        });

        $translateProvider.translations('da', {

            'MENU_DETAILS' : 'Detaljer',
            'MENU_MAP' : 'Kort',
            'MENU_TABLE' : 'Liste',
            'MENU_PDF' : 'PDF',
            'MENU_NW'  : 'Navigationsadvarsler',
            'MENU_NM'  : 'Efterretninger til søfarende',
            'BTN_CLOSE' : 'Luk',
            'GENERAL_MSGS' : 'Generelle Meddelelser',
            'FIELD_REFERENCES' : 'Referencer',
            'FIELD_ATTACHMENTS' : 'Vedhæftninger',
            'FIELD_CHARTS' : 'Søkort',
            'FIELD_PUBLICATION' : 'Publikation',
            'PART_TYPE_DETAILS' : 'Detaljer',
            'PART_TYPE_TIME' : 'Tid',
            'PART_TYPE_POSITIONS' : 'Positioner',
            'PART_TYPE_NOTE' : 'Note',
            'PART_TYPE_PROHIBITION' : 'Forbud',
            'PART_TYPE_SIGNALS' : 'Skydesignaler',
            'MAIN_TYPE_NW' : 'NW',
            'MAIN_TYPE_NM' : 'NM',
            'TYPE_TEMPORARY_NOTICE' : 'Temp.',
            'TYPE_PRELIMINARY_NOTICE' : 'Prelim.',
            'TYPE_PERMANENT_NOTICE' : 'Perm.',
            'TYPE_MISCELLANEOUS_NOTICE' : 'Misc.',
            'TYPE_LOCAL_WARNING' : 'Local',
            'TYPE_COASTAL_WARNING' : 'Coastal',
            'TYPE_SUBAREA_WARNING' : 'Subarea',
            'TYPE_NAVAREA_WARNING' : 'Navarea',
            'REF_REPETITION' : '(gentagelse)',
            'REF_CANCELLED' : '(udgår)',
            'REF_UPDATED' : '(ajourført)',
            'ACTIVE_NOW' : 'Aktive nu',
            'SHOW_ATTACHMENTS' : 'Vis vedhæftninger',
            'HIDE_ATTACHMENTS' : 'Skjul vedhæftninger',
            'MSG_NOT_FOUND' : 'Meddelelse {{messageId}} ikke fundet',
            'MORE_MSGS' : ' samt {{messageNo}} andre meddelelser'
        });

        $translateProvider.preferredLanguage('en');

    }]);

