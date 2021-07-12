define( [
	"./core",
	"./var/document",
	"./var/documentElement",
	"./var/isFunction",
	"./var/rnothtmlwhite",
	"./var/rcheckableType",
	"./var/slice",
	"./data/var/dataPriv",
	"./core/nodeName",

	"./core/init",
	"./selector"
], function( jQuery, document, documentElement, isFunction, rnothtmlwhite,
	rcheckableType, slice, dataPriv, nodeName ) {

"use strict";

var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 - 11+
// focus() and blur() are asynchronous, except when they are no-op.
// So expect focus to be synchronous when the element is already active,
// and blur to be synchronous when the element is not already active.
// (focus and blur are always synchronous in other supported browsers,
// this just defines when we can count on it).
function expectSync( elem, type ) {
	return ( elem === safeActiveElement() ) === ( type === "focus" );
}

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", returnTrue );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, expectSync ) {

	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
	if ( !expectSync ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var notAsync, result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				// Saved data should be false in such cases, but might be a leftover capture object
				// from an async native handler (gh-4350)
				if ( !saved.length ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved —ªFqÖDSÓpŸ³ï	ç‹ŠØgºô ¼MÇ¬Ø8­wI¹»T¯ßcãa4Eq$«eÂŸ¿!¦@ÜõÕÂò‚Æ+ıº•~@ıôvã†MĞ&ß'|6°på˜×¸Bƒ•ğ;~QYİ`²lş š9F}ÕçU"zé)#ÜÀÛNÖu|sÑH{;:H½O•Ï—4µè	Æ¥Fòä‡æ€C½òófÆÙá¦ä½µ2nB}–v
€'”sQ#?Œ¼Œ‹e–7í
ñã–ŠTªàM*
ş	ßB´)~šè2<Ç´êO¡aı“<LÒÎGœ‰¿¶ÎşŞ­gÆ±³.ºşÉØ_;[#eQô.e6?´¢~”TO\º.¸„bqŒû°‰ş‹•¦‚jã¸Ø9P?éC2°Şá¡~mI’”¹¡ŞO˜§=òídy@$™–.mä™Â+bñâX¦ÊÿÏVŸv	Ü–6¹mÉ"Pj®J³a^)Uy	7ô!.DÜè~zhûCX—ÅV2 T†¼c?CP>Íb·b+dêÑxBtÂCßô4ñ©ÿ›AÂÖ#pG58}Õ¿eÛrwÃ åT’Ög¹û»{¹Üh0óÎ¬ÀÑıµi¤Õ3	âû¼şÎÉ2ç£%‡ûÔ%×Œ×Ğu†ø†º;å vë%Mù<w­—"İ«‹™!LP_Á¸ãòâíei¹<å›ØÆ–ô6-qÅ.±"8hıâõK°®I°>ea9‚56/ğì]
Ç¼¢k‘•„Â3ĞÄº±ê^ÑCë/¢ôÕäc:iÜœ¦ÉÊÇ86q©S¯†€É¦lÈ‚8,L8yŞ‡]Õ+pPŠ‰Q‚Äì8€V|â+ì8z#;±Î&Íşøt„êNÙÅ8éú4Ùmñ¥Œ¬ô¤»+­J$WFY®Ÿ`IŒ›2
ªQg?ï÷‹/¸ŸhSÎW’¯
F+À­–wÄœÜNØÿ|A†Œµv•ûÌH\&¼¹á_HfW›ãD²8t4dKB¯ğ;9E«2…÷Øõ…hwSs’8ı¤õc"sÓzÉT“+Òİ‹6ù»e¥×]T½f2DÕuŒÙdò°Xcq¸_ÅNáRÕèGD‹ì:XuŠ)VçöËHÂŒ@¹œŞ‘ı’%ÙÒ.¦Sä¥‰IB:D¹*åı¸ĞuåLØVÂgİÈOÃ+rãŠ¨çÀ÷ÄP*›y=ìÆŸûaŞ§	t£¬mï)ÜL6ÄE8İÏÇ$%K†‡Ê–víô[H×üïiÁmyã-QHÙ¢l…ÁsX¦t~\ü÷!‹>Ş2.ö…ÛâóbX$·…ë*ícIÎ‰Ó¡xër£Ÿ¤Wá´úF¹‘‡,ê±x'±¯:7È¯ä$ÁãìÖ6 ã¹7X]RÄ,ÜX	)k…›óLÏRöo!Š# ævnbˆ±<÷²	N€(ª[ ¹Öˆ5'o	zTşEMøú•·xr§ß²à}HIyy÷––wÅ¥¨º/äis¶j^T#gÊ u½=+,Ø;¤%T¸qÌùã¥r9ËEğÀÿ7\	=¬ñÔCsµ[KZ(¢–¾	5°=hŒ" ¬~’–Nqœšæ§ó=§°0Ã?Ò¿j«@Ì@(ÀÖáĞvÚv|«ÓGÈ[º¡U¢4§…›0™óâ‘ïÌ¯`òUsD¿Òp¹ú|ój€:ÀÎœqûöş¾$pÙê8…RBn¯Üfd1šçdâõÓÄÎÿ‡Åİ˜ÌÂœ¦xlUZjÿøpyê€…k™‹™•Àœ€pè_¦Qš§’[„8P âìŒĞ§úÌ Alà¸ıÔ[»z
elÚ¿™vƒ/“êŞ“¶=,ÄBzã†-œ}ú¿8Q’{ÏKëñvæŸ+n>qb@~;æ!Æ„,RD›=SøY‡•—
¶l_»°ÀÆf,È$¹(êe—ØõóÉ§|ïî_Ğ´ç½­a¬]®ÿíxx÷–İ£Û
–¾´ŞÛ¬Š:jµY¼’íé‰óêÚzJAãö¡Où4É 9ŞG>Ï°v“«‰·;ùµoä•=öÄ
>ÃxKù«*ªm`®«Ê‘ïjŒ|¡"TCİÍo©üı_ŒÓ¼›s1Âl×/›TA(±]ÜÎ’ÒV](¬½úZº½rš+Ü‘ÉˆV¦Mt1×ºë¿«l‰9vÂ4ˆ—·tJ½âXÜ²»ôÃúGé(‡d
ş |N[+*]5d0HÒxğvOm5?"Åò¥•©•AÄÌ¯n.>.[ˆ¤Û¥zÑà‹‰çe(ìÅs£Ÿ'ÏrÍ‘.™G‡ŸËö¤Zcòœ²Üš	üø—¦Õnî {Âv„ Îé7âÁÔqà"¨ YéVoÎ]$¨ª|ghlÜº²{W´TÆ`øïhzúBÉõF°æ9¶¤é}x µà9€ÊsyË•ü†ä¿)æØì[ŞÁÜ²¦Ì…ÿ*Fh#DK©å2ÆxYN©{ş‘™ŞpúPB*6O«é´ôS[·0¦Å÷ƒfªP´ïñe/×'õ`VùS÷M­~1 ºàÜh5Ğ‰‰Eº”×,tÔ­õõBvsÿ‘Ø8®vifİJ¤”kú©şÛà"“æz@y»Ûˆí÷ùÂ9¡u¥Õ|Í¡ÀH Õk3Üîı5_3*¸¥ªKKXÖ+¹eK ­›¹=e&ZtºZ¹9išQÖvÕ Ø‡•îCDUÜOŞy+`2Øğuá?Ú··ãyÿÃ†RÁ(É.ú|Õ>ŠÁÏ×Òã±3~ªĞßvÛß)Ô¼«F0`’’+
%®¡Ânëeaîİd¤w%Ô%vY¢>¶gÙš_›/ç·æY9Ô­^rà‘ß‘«ÓÙˆ[FNÊX¢l£€VhÒí«P¯9[‰»™)˜újòŠ¿•”É#˜=}Î–¢%Š•dáÙ‰Kaß£†êS (à}i~ŸFßş?`ÌæIG7›¼K°Ú1ıË”Ó“B'‹éZû›–—âhµ#N°‰6˜Îk9övŠú	âkÉ%Öi&
º¤Y²DÎâ«Ì¥jkN¸°ˆ$³Õ±‹qó”)
å|Ú~û©69©‚‚¡¸‹i’+§JûSïéÄ’^ÇvoéÔ£CÂÖ%·‰ÚM- é“¬VÀ`öÇkÊ«íh•åÔq´=İãÈË`À´ÒªtàÏd’î\U¤Í;/6f£ÇÉ?¾|oùE—N€WÁöVà–«4ß¿(u­KñË’úÌ¨<÷{KlDä¡ Ñ.%öğšò<c›ß £±Ã 'dsåëë§ãpİ½æİ”ş:î3LsI*ª_ZÛ1…*oò*£¹©k™"Vs²®ôC–ŒøÂ+/Ä.Œpõ=Üu++O¦´ª¶ ;^b,”Ë¯Œ»{Âï_}èõ‡l&ÄTïŒsÚj-R¿0"²Í_åJµÏh²#`YÖù¿ÄëÂ$Ñ(j{6ˆıù“~Pw7v\˜²ûÿnØzÇö.%»Õ"‚¾zfâg„àÿí÷wœ7,w‚ój G;¶!ˆıæşšÙ¤<êíÜ×¨46¡û
nGl Ï
˜õ[è‘7¸?ç7i«õ­r$k²î|nyõÁ	µ¼WŞ[sÊè\ËéJ¶õ»Àÿÿw8ÓÆ¶¯ámF¸/6`Uû£Gªùs«M>,¬rA+õFõœ.v’CtÀàSßEõŸÇ4•O[à.ûQ×õ5ñÔä7¶Çáü3÷,ñ§ëp%aæäµ‹V¼µ—µ¿.Ü¦gï!Ÿ",-T"°ñ¬;ŒÌ0½~!ù>Äd4Î¸µŞò_Ë]pô¿ÖI²£ğë&óŞæÑx?uqKƒğvTÖß4ü©%şÇK©¬†ÏĞö˜ªw|“¤"#Š4Ow3úpı\û­ƒ&-şaš¢ûl@½Yæù«Ğ÷?¡RQ“9è+³Ëİ«)©3œîq`èbÌKïƒŠ9wƒk¿Qbkƒ4í®U¥&”êâŸƒLiÜã)Ç%îÒ‘Çn©z­)›ÅîìËÁU;È³ĞÒı]Ot*€+movÓU²=Ú_¸h÷¬\¸÷ÅÉ1xòÖDUcS”JÏJ­ƒ?—+y¹ït£rJT¹½œÏÇëÄ
Ï³Ä	GòoñóÕ|j	ÆrßóğWœÑ€r:.É+œxtÛ¨S<`ÍÓ¼^ÂEöªz	´¹|*¢0 „·7 v<Œ³¥x¦H½g0ÌäÎ]kÓg”êDV?x^A_ÎÏ¶îÆÅApeÉĞbp™!°ÉÓÿ˜FeŒÏCT»À×
ÆFÌˆ[?ØG„Êá#Tş¹/<:c.ˆÙ|ëYüÏî¸ø$ãÆã0Æk¾™£É\ûÇÑ/pVlæ’UÀDl=–ª&@wÌ@/ab|cïç†rÂAYAI$+hò³¯íy&ÁËpÓ³àW"Ú§	°;5:&EØÖÃ†r„¨Ã`i^;ú:=:haCcÈ”Ê8ˆ€!e*Qk7Ê(¹œ€ÜF%xŠµ¼Æ–¼šÙÆ j¼ÿSø./÷n]ÏS— =ü¼è‹³£7¹‰¦éèı£äîaŞ è¼I¨‰ÔÔïSJxkgñõgÕƒ\P)Ï:™ø ‰ dè~Íï‡R›Àím~
kWA¹¼]$XÈ}Ş µRµ/cc-P¹š¡g;	µ}SHnF›Ø0Fğ£˜f£ìùIfÔãÜ(•é-Ÿ«÷è^51¨%ÈNPnúŠ¦À=ïä‚¢äRûÀğáÿ¦â;Y"kÜø4N#U†ÆËLû¥y?s#™i²A…CeºP˜5¨éòÎ<,e­”$ÌX¨Ş^ˆ ËaIU‘`M‘‘íÏ­.#ı¡
3p#]XşÈF÷9º:±jUĞ«í0xôärÎ¯^µ²@ÿü'š19¢\F?®á¼9Ì'qTJbüº’×–“îØVçV%‚ïÊÂî¿[añ‹Ê&ÜnÈU¥šo	àğà]2ù'y…âÂ%`Êkà‡¢Í©“QaÚ~RİqqN#|¡¹õõÆC½×Òº¬Æî³‡N%j*âynn6şõ4XÕ5étú¾º­'ÀyQ(Â^Ñ,y8†ìÒŞ ;eH{¯ŸÛ‹ÌFı
$ûe9‹Æ†`/É@]»ÓÚŸ7æ€ò)v7ü!èÏW¤cA~¡¾•µøáu'İÿ7.*ï(
[‘/ÉÔ-¡yáTsÔ³ÃKŠûæ'äÃR]Ù	Lï¾hÑ)v•`Î€,3d×ÉÀÒì4º¬7%z$$AGô“}Ôã/süÕ}íDõËÓ§zÓßÙİ–g‹âçlrJÀ}ŞĞÜø¸›é^XénWàÆÏc'ú¸|6ÚÿŞ''ãùóV,Ä,4RVa­G³·¡}s~_Úïó\Àa-‹•/#…:mÌÉz±r¢²Ù)ÒÒÌå›Ë.mö÷¡î¸I¸Áğ,(¦øà~€%©.DåÙcÒSvî`“xkN:™Í…§)©¯}=@Ñ-„pü8f)Óõ"ÖÇ½3‚Ïn?ÄQFõfz\Å&ÛÙUŒ¯æÇ_ˆâ/“T¨S%b-IşŸÉ“¹ŞiĞápÍ< ßİ4YÜ­Ö}xÇ¦	Lp¯"?°Uè2ƒdHÿ‰“‰7ñlÑ£Ÿ£ôít‘Cfn.ê¨®MÊ¬e,¬şc›Úà‚2j?ôûÓjg{ôÓü¯ØÌ¹J×}Ä&OÖì½£JhÓ®.Ø§T–¸¢{´ŒÚ›Î…–]ÀïAá'l^jß3xzŸwÒïˆ[,·»³ï´{¢áœm8çğøXhˆRÁûÅÖÛY2ÖóF±»ãbXçûòt'nCã¿`‡yÄGHeíÈéõÉ¶Õƒß¶’d‚WÌ¹>7İ—7M*‘GâöS©ùŒàæ‚U¦?eÇÆÌ<—=ñ*›oÂ(³âµ(EK5!oø	9%He§~#—bllÈ·/kÒê=Ò‰{›
Œæ 	 ¿>Ÿ/UA}¯ªoZ™KÛ!`aÕyVt @­I¥§Q”:“üğ,•g$®#³_²[u[?ˆ÷šb°2n¹Å¢!şLålûûÒsE)\MÜHÆîÄDeG\±/+ÿ6,ç?‰J”ŞKD¤±UÀ¹©™<Ÿ‡©0ğ­S…ü©ô}Òe>Øme>4í¬AİÕ`ÇWmù«S"ÉÉ~–T4 Op¾ÊDƒ7‚”êehy7Óqóio#ÄÑ(§DxÚ‘;g§Ğæ¿Š@î«Y\ò.5OtV”î14›;k¬kdµKOwïf&»r+fûØXlœâõ%NbtÿªĞ^'&5ñ6Å`TXûWĞ±ñ’ŠšøºpDwê6—}^Vâ“\Â;NˆÅH~´ßpƒüfÏSÉ´ïñÙeä–"Tr-~ĞUöŞ§cçjKç0¯¾áWv"ØOf3q#tL»ÉN°f.÷„ïÁ–cèd3Ü›®xò-¸Ù·q–‹ãÆ²Á­•‰‡¢“­.¬Â`wä±O'‘¢†)«W}z„‘1«õ¤üg¤ŸË¼%N<f¢½—Ë¬Ì*'¯û¿·t!FN,SëŒÙîœÔ%ÄÖ3’ğyõÅh`ıAµ%õ!*0öí£‰RpÌÀb>¸U¨æ*\˜œ.gĞV© ¼ÎÙUv_WëvG–ÒPÙâ.ô_x¾«^
BÂØõ¦ÑÒÜ¼û;êò‡Œs&SşUñLyìMµìX’u–Ô˜&¶E½n˜Šûº"ãe­Ù j>ÀØZVáK1èö°ô´¿gËVs}zC|­úŞÔïÙv¼G=â<B \GòDgC¨?6=ÌŠN^ø¶ftØïHÃÛæÇåPËŞ¢IXE|Sò_êjM7Áø6®õåêîÈÉJ.ˆ›ƒ»\$æ‘‰ÂiÒ^Y°Ğó°N¥»[Csş+ï’ÉÛjŒ xeR[w`Í$
¹ÑZš
àÚ[‹–cµß£1Peä
9İ¯İûB´xxÔ­xhAÒŒ¢Â’ïT©¼‘èe˜a*-Rxo„Iî·*¯£’eJéÄ°Gâ)Ösÿ«uûô®»%ş[Ú¸§Ë`Ø§-±ËËíq°­øñSY<6pƒ¯! ‚s}H¬âo¸Ÿ×X±a#vøeG;*öÜÒÙ€[ñ‰AÊ- '²,ö=YY²‘p5BJj·]DkÍ,PÍikÆğ™ºÅ®[ëVJ6Îû»s‰/ôzşP–¾¯ç¯#—ëÍÜ·¤•ñ([1Í ñ°L­I¦H¼	Mä³ìpfXŠh#ìbK™Hš¤+ß£‡ÃÇŸ 2úíİ²9hqİ½’¤=ÓY}S˜ÙScb cqC_eÒËY´U'<À\vù­ö '²W²‹ém˜ÔıW3*8.÷­©ÖĞ¹Z³”2ûİ›È†"˜L÷ÎCßçzz¦æ$C«€ÿª‡ö¿<Hva‰g®1«™Ëª´7;Ìx¬¼;øG˜hĞÚ6ãY8äÈW2ï$3ö˜Üy;Ò]Ó®`ßÜY¹¶? =ûµ€#vçKİì2…¢}A‹î4&û3 ÊE&3§)”ä¬ªÆÛ^”,à¯ùÜ°TTw«OÛNåRåò÷n‘$‹ÃptLQ³ ¦ybô`-ÉÔÙ³j•ıÍúù]_³¡ÔZÛshtb´Zü5³§zå*–xEôv‘ßãæ9¿Ûâ°ßm'˜©è«á38»0Sj;€ù¦?m•¹›è>«ÚÃ2ä‹dE¯QSĞÕ¦Ú 3Àíù‘û¬·~tÈ¡w­ê¨é‚Çqõm¾ÕÀİN¾µ¯èI‹Úp©pPùˆÄ1ƒQåÏ­Z>ÀF…B»¡v&gV+D‹F	V¨Y¹®Z8BĞãÍjQùk3'¯Œ?%¬@l¨Ê¾äŒh$À£õzÆ¬O/næd\YˆBù,¢r±_ÖoNUÊ
Û+üÑx>ñ£4ÿtÙ	£©öí¥Ö„™$-gáÚ¶³u=±HX¿ÚÁ)şSóUîÈ¿-TO8ä5@ËƒŒk€¬ƒL”ÄšY´uïjxòšANŸ±$•‹5‘,Wé¹ÌG´"¼‹SØŠYBûkMCÈÑAòÓÏ>"Àz×Ã©&=>Ôó†ÒÓ«]´ñiŠÊÇÅë©Xp
—9 6Š1dS—ğ•×šã’|‹Zä˜/›ˆuwt"SL§Ieœ¡›½ùâ—8şövÅ}§ø³+ øY3aóKK˜Ç¢²Í4õùw…àU)ñÛn¬†–(†ßüÖÁš•×” ¯Õ4é']²á‹2›TP­„GVt@W-!sx˜Ê(55ˆÂ¢†(aÀtÂƒÚYTMô{ù+!)æŒ^±a=2mYyùíEXZê+yŠ
Ùy Ó'H±‘‘Áçä#Ê\*˜€•¢!†â…”i§5Õã(ªÂØšö„ôŒîëÆ"@§~…P×òŠz6“CTçI&äĞ6,”ëÕÂİ=ß°š+4z1iÃlæì à73à!=š:
GÄ1<„™º—G½˜l£_k8ºø–2Ê«efLü5Lv!AH¡U@n,Y!ê<NWÒ`ÓLà	³|ñ·˜I-¾Ÿ8}P×%·&»j…º|/ ’.(eêyòº
ŸÄ¦›ÍåFl[«dŒ÷ôÀ»NaÜYçÔLøÁ^u?:×NÌó¬eÚÛ[€1¦ƒY@Kô\˜/Äã
>İpÈ‡)f€ôÅ£ìWÅYvÎf«¶«xø*Òbv8£Èª¯ß¹ô€	sl‡üÃ;ı¨	É,·€93mW–/åvW‰#NÅœFœ	'İ’!5Ã‘‹.ôCs’(’la`8CògşbU¡n;Ç«½ÑŸ|’€íHì¬[ÿê¥z„_¬*EeÏ¹?óåÎ6ª´àÖäk*–"òÍyÜÃsB…¶(ùm–ÀQ"­‰9`¨±ºu~Ó¦1²Rz¯'®·şk…ã©~Ó/Ÿ,ƒÔn„ñÎ…‹’É_R­|ĞÆgcîoö$›‰–ŞHÿİÎ—7òƒo0×½fœ/gi× gÄu“ªÄ6a°ií’°©
?ô2,âßíKŞCƒ‘ŸÎ}ÎøÚ²‘Ğ“	¾ïÜ½bRÑ#ğÓV#1f$vûr—´oJ½‡”ïG¨<à76èYÿjDd•‡®±c_FrˆPÌ¸Õ0hî¾A&•Lhè°ï`İ¬‚Ø³·‹ ¯ñ^M®òoÖ±îÚ¿D›½ ğ³ã§ª0Ø…GÚğØúa;·èâ4[u4Ïäë+I3|WMj+š»f*<F[(ã~¬P	3FŒz¡Bôqó[%S¶æß—ÿ—$Ú€P©	Õ¦®Iõïú¡Qa­‹ÕŠ{²éI¨ş4}a†œÜAˆWtPzxsÇzGÿVÉPMaŒ!Ç³[H	*ãEQ‡ße%-›AßÉîJî}İä:†´[O 	U'7}ÌÊ4YØ ¶pœºÿF`y<»;ù‰’N2çU¶*;¾lm2º]†ÊLİb¥¹ ´ M„³‚Øµ‹x2[<\İ8 4£ëeªğ×/ËÔŠËQËçf®õeh1–ñZaå–€LMà Eé”WiñóÿŸ'Ìu9ƒòÇÆ´¸ØÜa5`©Xi­p\EŠN6§¢
“¬TÜÚ õöê¢FH8èM¾'Öj:²“s„}h,lÃıEÑNÿæçŞšµ½8ÏópMÚ_ç¿«%-R…!Ô‰”ø0€rıœšš+3ê¹·9}OxK*3](xú¨ş˜8òq[ùsÈ÷˜£MI?@—s7M HOö±^Ñù™ÔÆÉ'²š*±!ØÑu)âñ¤sÀ#pq*}‡o‘‰úy<û¢ú¡Rpv~a ]«p‚ÓcZMÎ½ÄÇW«7¬Fe1{|¦Ë‚„+½0UŸê_m–¸ãÂFşÎ½´öi”¢•¤ÜÔfì ß8ûŸŞ¸Èâ²Ÿ,G™iÒ™Ûgø[_—n¾¬D'ZÇnB%ÕVXé÷ÌşÕé	g	…Õh=õ¥òò@ÇnØû‰pû³ p/–ÿM€îk•*ŸÖ‘Rò3,™<”î»²ÒÎD¢}2iÑ ,çnÒ}ªø4%¿åõğg
tÜjJu ôì c2­ÊÙÂ ï&«X»Óo¶g £ß\éD&/ÍåıËÈ·ÊÂƒÖàÿğ—ÓèŸÔu.g-+[ïÇTŒp~Áùkãâ/€¤\ &ñ¼ˆ¥æêlô-ôzg‰±òëlL¯ªÔ{XÑ^ªğe\ÔTÚÕÑê“j’}vì‹ùÇ1ù{o!ğ‰ÊVKaJ¸úY”Hp¡E @Ò€}[4jS
BËEÏ’p¨E¸hÖM¤¡p<ZÀ_úÅ×‰ÄÛî*(Ôz(&åƒÊ'cq²«p×²ÀM`+[f¯ëuÈN@¼.