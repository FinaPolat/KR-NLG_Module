/**
 * Global utility functions
 */

global.owlPrefix = "http://www.w3.org/2002/07/owl#";
global.rdfsPrefix = "http://www.w3.org/2000/01/rdf-schema#";

//this information should be acquired from the n3
global.knownPrefixes = [owlPrefix, rdfsPrefix, "http://www.w3.org/2001/XMLSchema#", "http://www.w3.org/1999/02/22-rdf-syntax-ns#", "http://www.workingontologist.org/Examples/Chapter3/Product.owl#"];

//Remove prefix from URI
//@prefixes is an array
global.removePrefix = function (uri, prefixes) {
    var index = 0;

    while(index < prefixes.length && uri.indexOf(prefixes[index]) != 0) {
          index ++;
    }

    if (index < prefixes.length) {
        return uri.replace(prefixes[index], "");
    } else {
        return uri;
    }
}

//search if an element has a label, if this is not the case the name without the prefix is returned.
global.searchForLabel = function (data, db) {
        var results = db.find(data, "http://www.w3.org/2000/01/rdf-schema#label", null);

        if (results.length > 0) {
            return getLiteralValue(results[0]["object"]);
        }

        return removePrefix(data, knownPrefixes);
}

// Function to turn links in to link
global.linkify = function(text, prefixes, cssClass) {
    cssClass = (typeof cssClass !== 'undefined') ?  cssClass : 'text-muted'

    if (text) {
        text = link_replace(text,
            {
                callback:
                    function (url) {
                        var full_url = url;

                        if (!full_url.match('^https?:\/\/')) {
                            full_url = 'http://' + full_url;
                        }

                        for ( var prefix in prefixes) {
                            url = url.replace(prefixes[prefix], prefix + ":");
                        }

                        return '<a target="_blank" class="' + cssClass + '" href="' + full_url + '">' + url + '</a>';
                    }
            }
            );
    }
    return text;
}


/*
 * linkify - v0.3 - 6/27/2009
 * http://benalman.com/code/test/js-linkify/
 *
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Licensed under the MIT license
 * http://benalman.com/about/license/
 *
 * Some regexps adapted from http://userscripts.org/scripts/review/7122
 */

// Turn text into linkified html.
//
// var html = linkify( text, options );
//
// options:
//
//  callback (Function) - default: undefined - if defined, this will be called
//    for each link- or non-link-chunk with two arguments, text and href. If the
//    chunk is non-link, href will be omitted.
//
//  punct_regexp (RegExp | Boolean) - a RegExp that can be used to trim trailing
//    punctuation from links, instead of the default.
//
// This is a work in progress, please let me know if (and how) it fails!

global.link_replace = (function(){
  var
    SCHEME = "[a-z\\d.-]+://",
    IPV4 = "(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
    HOSTNAME = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
    TLD = "(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)",
    HOST_OR_IP = "(?:" + HOSTNAME + TLD + "|" + IPV4 + ")",
    PATH = "(?:[;/][^#?<>\\s]*)?",
    QUERY_FRAG = "(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
    URI1 = "\\b" + SCHEME + "[^<>\\s]+",
    URI2 = "\\b" + HOST_OR_IP + PATH + QUERY_FRAG + "(?!\\w)",

    MAILTO = "mailto:",
    EMAIL = "(?:" + MAILTO + ")?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + HOST_OR_IP + QUERY_FRAG + "(?!\\w)",

    URI_RE = new RegExp( "(?:" + URI1 + "|" + URI2 + "|" + EMAIL + ")", "ig" ),
    SCHEME_RE = new RegExp( "^" + SCHEME, "i" ),

    quotes = {
      "'": "`",
      '>': '<',
      ')': '(',
      ']': '[',
      '}': '{',
      'Â»': 'Â«',
      'â€º': 'â€¹'
    },

    default_options = {
      callback: function( text, href ) {
        return href ? '<a href="' + href + '" title="' + href + '">' + text + '<\/a>' : text;
      },
      punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
    };

  return function( txt, options ) {
    options = options || {};

    // Temp variables.
    var arr,
      i,
      link,
      href,

      // Output HTML.
      html = '',

      // Store text / link parts, in order, for re-combination.
      parts = [],

      // Used for keeping track of indices in the text.
      idx_prev,
      idx_last,
      idx,
      link_last,

      // Used for trimming trailing punctuation and quotes from links.
      matches_begin,
      matches_end,
      quote_begin,
      quote_end;

    // Initialize options.
    for ( i in default_options ) {
      if ( options[ i ] === undefined ) {
        options[ i ] = default_options[ i ];
      }
    }

    // Find links.
    while ( arr = URI_RE.exec( txt ) ) {

      link = arr[0];
      idx_last = URI_RE.lastIndex;
      idx = idx_last - link.length;

      // Not a link if preceded by certain characters.
      if ( /[\/:]/.test( txt.charAt( idx - 1 ) ) ) {
        continue;
      }

      // Trim trailing punctuation.
      do {
        // If no changes are made, we don't want to loop forever!
        link_last = link;

        quote_end = link.substr( -1 )
        quote_begin = quotes[ quote_end ];

        // Ending quote character?
        if ( quote_begin ) {
          matches_begin = link.match( new RegExp( '\\' + quote_begin + '(?!$)', 'g' ) );
          matches_end = link.match( new RegExp( '\\' + quote_end, 'g' ) );

          // If quotes are unbalanced, remove trailing quote character.
          if ( ( matches_begin ? matches_begin.length : 0 ) < ( matches_end ? matches_end.length : 0 ) ) {
            link = link.substr( 0, link.length - 1 );
            idx_last--;
          }
        }

        // Ending non-quote punctuation character?
        if ( options.punct_regexp ) {
          link = link.replace( options.punct_regexp, function(a){
            idx_last -= a.length;
            return '';
          });
        }
      } while ( link.length && link !== link_last );

      href = link;

      // Add appropriate protocol to naked links.
      if ( !SCHEME_RE.test( href ) ) {
        href = ( href.indexOf( '@' ) !== -1 ? ( !href.indexOf( MAILTO ) ? '' : MAILTO )
          : !href.indexOf( 'irc.' ) ? 'irc://'
          : !href.indexOf( 'ftp.' ) ? 'ftp://'
          : 'http://' )
          + href;
      }

      // Push preceding non-link text onto the array.
      if ( idx_prev != idx ) {
        parts.push([ txt.slice( idx_prev, idx ) ]);
        idx_prev = idx_last;
      }

      // Push massaged link onto the array
      parts.push([ link, href ]);
    };

    // Push remaining non-link text onto the array.
    parts.push([ txt.substr( idx_prev ) ]);

    // Process the array items.
    for ( i = 0; i < parts.length; i++ ) {
      html += options.callback.apply( window, parts[i] );
    }

    // In case of catastrophic failure, return the original text;
    return html || txt;
  };

})();