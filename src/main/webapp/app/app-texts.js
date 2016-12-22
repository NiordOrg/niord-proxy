
/**
 * Translations.
 */
angular.module('niord.proxy.app')

    .config(['$translateProvider', function ($translateProvider) {

        $translateProvider.translations('en', {

            'MENU_DETAILS' : 'Details',
            'MENU_MAP' : 'Map',
            'MENU_TABLE' : 'List',
            'MENU_PUBLICATIONS' : 'Publications',
            'MENU_PRINT' : 'Print',
            'MENU_NW'  : 'Navigational Warnings',
            'MENU_NM'  : 'Notices to Mariners',
            'MENU_DOWNLOADS'  : 'Downloads',
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
            'STATUS_CANCELLED' : 'Cancelled',
            'STATUS_EXPIRED' : 'Expired',
            'REF_REPETITION' : '(repetition)',
            'REF_REPETITION_NEW_TIME' : '(repetition with new time)',
            'REF_CANCELLATION' : '(cancelled)',
            'REF_UPDATE' : '(updated repetition)',
            'ACTIVE_NOW' : 'Active Now',
            'SHOW_ATTACHMENTS' : 'Show attachments',
            'HIDE_ATTACHMENTS' : 'Hide attachments',
            'MSG_NOT_FOUND' : 'Message {{messageId}} is not available',
            'MORE_MSGS' : ' and {{messageNo}} more messages',
            'OPEN_PUBLICATION' : 'Download',
            'BROWSE_PUBLICATION' : 'Browse',
            'REMOVE_PUBLICATION': 'Remove publication',
            'TEASER_TEXT': 'View the current<br>Notices to Mariners<br>and Navigational Warnings'
        });

        $translateProvider.translations('da', {

            'MENU_DETAILS' : 'Detaljer',
            'MENU_MAP' : 'Kort',
            'MENU_TABLE' : 'Liste',
            'MENU_PUBLICATIONS' : 'Publikationer',
            'MENU_PRINT' : 'Udskriv',
            'MENU_NW'  : 'Navigationsadvarsler',
            'MENU_NM'  : 'Efterretninger for søfarende',
            'MENU_DOWNLOADS'  : 'Downloads',
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
            'STATUS_CANCELLED' : 'Afmeldt',
            'STATUS_EXPIRED' : 'Udløbet',
            'REF_REPETITION' : '(gentagelse)',
            'REF_REPETITION_NEW_TIME' : '(gentagelse med ny tid)',
            'REF_CANCELLATION' : '(udgår)',
            'REF_UPDATE' : '(ajourført gentagelse)',
            'ACTIVE_NOW' : 'Aktive nu',
            'SHOW_ATTACHMENTS' : 'Vis vedhæftninger',
            'HIDE_ATTACHMENTS' : 'Skjul vedhæftninger',
            'MSG_NOT_FOUND' : 'Meddelelse {{messageId}} er ikke tilg&aelig;ngelig',
            'MORE_MSGS' : ' samt {{messageNo}} andre meddelelser',
            'OPEN_PUBLICATION' : 'Download',
            'BROWSE_PUBLICATION' : 'Gennemse',
            'REMOVE_PUBLICATION': 'Fjern publikation',
            'TEASER_TEXT': 'Se alle aktuelle<br>Efterretninger for Søfarende<br>samt Navigationsadvarsler'
        });

        $translateProvider.preferredLanguage('en');

    }]);

