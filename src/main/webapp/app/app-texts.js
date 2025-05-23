
/**
 * Translations.
 */
angular.module('niord.proxy.app')

    .config(['$translateProvider', function ($translateProvider) {

        $translateProvider.translations('en', {

            'TERM_APPLY' : 'Apply',
            'TERM_CANCEL' : 'Cancel',
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
            'NO_POS_MSGS' : 'Additional Messages',
            'MINIMIZE' : 'Minimize',
            'MAXIMIZE' : 'Maximize',
            'FIELD_REFERENCES' : 'References',
            'FIELD_ATTACHMENTS' : 'Attachments',
            'FIELD_CHARTS' : 'Charts',
            'FIELD_PUBLICATION' : 'Publication',
            'FIELD_PUBLISHED' : 'Published',
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
            'SOURCE_DATE_FORMAT' : 'D MMMM YYYY',
            'LAYER_WMS': 'Sea Chart',
            'LAYER_LABELS': 'Labels',
            'ACTIVE_NOW' : 'Show Active Now',
            'ACTIVE_DATE' : 'Select Date Interval',
            'DATE_FROM' : 'From',
            'DATE_TO' : 'To',
            'CUSTOM_DATE_RANGE' : 'Date Interval',
            'SHOW_ATTACHMENTS' : 'Show attachments',
            'HIDE_ATTACHMENTS' : 'Hide attachments',
            'MSG_NOT_FOUND' : 'Message {{messageId}} is not available',
            'MORE_MSGS' : ' and {{messageNo}} more messages',
            'OPEN_PUBLICATION' : 'Download',
            'BROWSE_PUBLICATION' : 'Browse',
            'REMOVE_PUBLICATION': 'Remove publication',
            'ACTIVE_PUBLICATIONS': 'Active NtM and Publications',
            'HISTORICAL_PUBLICATIONS': 'Historical NtM and Publications',
            'TEASER_TEXT': 'Click the map for<br>Notices to Mariners<br>and Navigational Warnings',
            'MAP_COPYRIGHT' : '&copy; <a href="https://www.brs.dk/en/" target="_blank">Danish Emergency Management Agency</a>.',
            'MAP_ACCESSIBILITY' : '<a href="https://www.was.digst.dk/nautiskinformation-soefartsstyrelsen-dk" target="_blank">Accessibility</a>.',
            'FOOTER_COPYRIGHT' : '&copy; 2025 Danish Emergency Management Agency',
            'FOOTER_DISCLAIMER' : 'Disclaimer',
            'FOOTER_COOKIES' : 'Cookies',
            'FOOTER_ACCESSIBILITY': 'Accessibility'
        });

        $translateProvider.translations('da', {

            'TERM_APPLY' : 'Vælg',
            'TERM_CANCEL' : 'Annullér',
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
            'NO_POS_MSGS' : 'Øvrige meddelelser',
            'MINIMIZE' : 'Minimér',
            'MAXIMIZE' : 'Maksimér',
            'FIELD_REFERENCES' : 'Referencer',
            'FIELD_ATTACHMENTS' : 'Vedhæftninger',
            'FIELD_CHARTS' : 'Søkort',
            'FIELD_PUBLICATION' : 'Publikation',
            'FIELD_PUBLISHED' : 'Publiceret',
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
            'SOURCE_DATE_FORMAT' : 'D. MMMM YYYY',
            'LAYER_WMS': 'Søkort',
            'LAYER_LABELS': 'Labels',
            'ACTIVE_NOW' : 'Vis aktive nu',
            'ACTIVE_DATE' : 'Vælg dato-interval',
            'DATE_FROM' : 'Fra',
            'DATE_TO' : 'Til',
            'CUSTOM_DATE_RANGE' : 'Dato-interval',
            'SHOW_ATTACHMENTS' : 'Vis vedhæftninger',
            'HIDE_ATTACHMENTS' : 'Skjul vedhæftninger',
            'MSG_NOT_FOUND' : 'Meddelelse {{messageId}} er ikke tilg&aelig;ngelig',
            'MORE_MSGS' : ' samt {{messageNo}} andre meddelelser',
            'OPEN_PUBLICATION' : 'Download',
            'BROWSE_PUBLICATION' : 'Gennemse',
            'REMOVE_PUBLICATION': 'Fjern publikation',
            'ACTIVE_PUBLICATIONS': 'Aktive EfS og publikationer',
            'HISTORICAL_PUBLICATIONS': 'Historiske EfS og publikationer',
            'TEASER_TEXT': 'Klik på kortet for aktuelle<br>Efterretninger for Søfarende<br>samt Navigationsadvarsler',
            'MAP_COPYRIGHT' : '&copy; <a href="https://www.brs.dk/da/" target="_blank">Beredskabsstyrelsen</a>.',
            'MAP_ACCESSIBILITY' : '<a href="https://www.was.digst.dk/nautiskinformation-soefartsstyrelsen-dk" target="_blank">Tilgængelighed</a>.',
            'FOOTER_COPYRIGHT' : '&copy; 2025 Beredskabsstyrelsen',
            'FOOTER_DISCLAIMER' : 'Disclaimer',
            'FOOTER_COOKIES' : 'Cookies',
            'FOOTER_ACCESSIBILITY': 'Tilgængelighed'
        });

        $translateProvider.preferredLanguage('en');

    }]);

