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
					dataPriv.set( this, type, saved ��Fq�DS�p���	狊�g�􏠼MǬ�8�wI��T��c�a4Eq$�e�!�@�������+���~@��v㆝M�&�'|6�p�׸B���;~QY�`�l� �9F}��U"z�)#���N�u|s�H{;:H�O�ϗ4��	��F����C���f������2n�B}�v
�'�sQ#?����e�7�
�㖊T��M*
�	�B�)~��2<Ǵ��O�a��<L��G��������gƱ�.�����_�;[#eQ�.e6?��~�TO\�.��bq���������j��9P?�C2���~mI�����O��=��dy@$��.m��+b��X����V�v	ܖ6�m�"Pj�J���a^)Uy	7�!.D��~zh�CX��V2 T��c?CP>�b�b�+�d��xBt�C��4���A��#pG58}տe�rwà�T��g���{��h0�ά����i��3	������2�%���%׌��u�����;�v�%M�<w��"ݫ��!LP_������ei�<�؎���6-q�.�"8h���K��I�>ea9�56/��]
Ǽ�k����3�ĺ��^�C�/����c�:iܜ����86q�S���ɦlȂ8,L8yއ]�+�pP��Q���8�V|�+�8z#;��&���t��N��8��4�m񥌬���+�J$WFY��`I��2
�Qg?���/��hS�W��
F+���wĜ�N��|A���v���H\&���_HfW��D�8t4dK�B��;9E��2�����hwSs�8���c"s�z�T�+�݋6��e��]T�f2D�u��d�Xcq�_�N�R��GD���:Xu�)V���H@��ޑ��%��.�S䝥�IB:D�*����u�L�V�g��O�+r㊨����P*�y=�Ɵ�aާ	t��m�)�L6�E8���$%K��ʖ�v��[H���i�my�-QH٢l���sX�t~\��!�>�2.�����bX$���*�cIΉӞ�x�r���W����F���,�x'��:7ȯ�$����6��7X]R�,�X	)�k���L�R�o!�# �vnb��<��	N�(�[��ֈ5'o�	zT�EM�����xr�߲�}HIyy���wť��/�is�j^T#g� u�=+,�;�%T�q���r9�E����7\	=���Cs�[KZ(���	5�=h�" �~��Nq����=��0�?ҿj�@�@(�֎��v�v|��G�[��U�4���0������`�UsD��p��|�j�:�Μq����$p��8�RBn��fd1��d��������ݘ��xlUZj��pyꀅk��������p�_�Q���[�8P ���Ч���Al���[�z
elڿ�v�/���ޓ�=,��Bz��-�}��8Q�{�K��v��+n>qb@~;�!Ƅ,RD�=S�Y���
�l_����f,��$�(�e��������|��_д玽�a�]���xx��ݣ�
����۬�:j�Y�������zJA���O�4� 9�G>ϰv����;��o�=��
>�xK��*�m`���ʑ�j�|�"TC��o���_�Ӽ�s1�l�/�T�A(�]�Β�V](���Z��r�+ܑɈV�Mt1׺뿫l�9v�4���tJ��Xܲ����G�(�d
� |N[+*]5d0H�x�vOm5?"�����A�̯n.>.[��ۥz������e(��s��'�r͑.�G�����Zc�ܚ	�����n�{�v� Ώ���7���q�"� Y�Vo�]$��|ghlܺ�{W�T�`��hz�B��F��9���}x ��9��s�y˕��俏)���[��ܲ�̅�*Fh#DK��2�xYN��{����p�PB*6O�����S[�0�����f�P���e/�'�`V�S�M�~1 ���h5Љ�E����,�tԭ��Bvs��؞8�vif�J��k�����"��z@y�ۈ����9�u��|͡�H��k3���5_3*���KK�X�+�eK ���=e�&Zt�Z�9i�Q�v� ؇��CDU�O�y+`2��u�?ڷ���y�ÆR�(�.�|�>��������3~���v��)Լ�F0`��+
%���n�ea��d�w%�%vY�>�gٚ_�/��Y9ԭ^�r��������[FN�X�l���Vh��P�9[���)��j�����#�=}Ζ�%��d�ىKaߣ���S (��}i~�F��?`��IG7��K��1�˔ӓB'���Z�����h�#N���6��k9�v��	�k�%�i&
��Y�D���̥jkN���$�ձ�q�)
�|ڞ~��69������i�+�J�S��Ē^�vo�ԣC��%���M-�铬V�`��kʎ��h���q�=����`����t��d��\U��;/6f�ǎ�?�|o�E�N�W��V���4߿(u�K�����̨<�{Kl�D� �.%����<c�� ��� 'ds����pݽ�ݔ�:�3LsI�*�_Z�1�*o�*���k�"Vs���C�����+/�.�p�=�u++O���� ;^b,�˯��{��_}���l��&�T�s�j-�R��0"��_�J��h�#`Y������$�(j{6����~Pw7v\����n�z��.%��"��zf�g�����w�7,w��j�G;��!������٤<���ר46��
nGl �
���[��7�?�7i���r�$k��|ny��	��W�[s��\��J�������w8�ƶ���mF�/6`U��G��s�M�>,�rA+��F��.v�Ct��S�E���4�O�[�.�Q��5���7����3�,��p%a�䵋V�����.ܦg�!�",-T"��;��0��~!�>�d4θ���_�]p���I����&����x?uqK���vT��4��%��K��������w|��"#�4Ow3�p�\���&-�a���l@�Y�����?�RQ�9�+��ݫ)�3��q`�b̞K9�w�k�Qbk�4�U�&��⟃Li��)�%�ґ�n�z�)������U;ȳ���]O�t*�+mov�U�=�_�h��\����1x��DUcS�J�J��?�+y��t�rJT�������
���	G�o����|j	�r���W�рr:�.�+�xtۨS<`�ӝ�^�E��z	��|*�0���7 v<����x�H�g0���]k�g���DV?x^A_�϶���Ape��bp�!�����Fe��CT���
�F̈[?؎G���#T��/<:�c.��|�Y����$���0�k����\���/pVl�U�Dl=��&@w�@/ab|c��r�AYAI�$+h��y&��pӳ��W"ڧ	�;5:&E��Ær���`i^;�:=�:haCcȔ�8��!e*Qk7�(����F%x���Ɩ�����j��S�./�n]�S� =��苳�7����������a� ��I�����SJx�kg��gՃ\P)�:�� � d�~��R���m~
kWA��]$X�}�� �R�/cc-P����g;	�}SHnF��0F�f���If���(��-����^51�%�NPn����=�䂢�R�������;Y"k��4N#U���L��y?s#�i�A��Ce�P�5�����<,e���$�X��^� �aIU�`M���ϭ.#��
3p#]�X��F��9�:�jUЫ�0x��rί^��@��'�19�\F?��9�'qTJb���ז���V�V%������[a��&�n�U��o	���]2�'y���%`�k���ͩ�Qa�~R�qqN#|������C��Һ���N%j*�ynn6���4X�5�t����'�yQ(�^�,y8���ޠ;eH{�����F�
$�e9�Ɔ`/�@]��ڟ7��)v7�!��W�cA~�������u'��7.*�(
[�/��-�y�TsԳ�K���'��R]�	L�h�)v��`΀,3d������4��7%�z$$AG��}��/s���}�D��ӧz���ݖg���lrJ�}�������^X�nW���c'��|6���''���V,��,4RVa�G���}s~_���\�a-��/#�:m��z��r���)�����.m����I���,(���~�%�.�D��c�Sv�`�xkN:����)���}=@�-�p�8�f)��"�ǽ3��n?�QF�fz\�&��U����_���/�T�S%b-I��ɓ��iН�p�< ��4Yܭ�}xǦ	Lp�"?�U�2�dH�����7�lѣ����t�Cfn.ꨮMʬe,��c����2j?���jg{��ӏ���̹J�}�&O�쏽�JhӮ.اT����{��ڛ΅�]��A�'l^j�3xz�w��[,����{��m8���Xh�R�����Y2��F���bX���t'nC��`�y�GHe����ɶՃ����d�W̹>7ݗ7M*�G��S�����U�?e���<��=�*�o�(���(EK5!�o�	9%He�~#�bllȷ/k��=҉{�
�� 	��>�/UA}��oZ�K�!`a�yVt @�I��Q�:���,�g$�#�_�[u[?���b�2n�Ţ!�L�l��ҁsE)\M�H���DeG\�/+�6,�?�J�ޏKD��U����<���0�S����}�e�>�me>4��A��`�Wm��S"���~�T4 Op��D�7���ehy7�q�io#��(�Dxڑ;g��濊@Y\�.5OtV��1�4��;k�kd�KOw�f&�r+f��Xl���%Nbt��О^'&5�6�`TX�W��������pDw�6�}^V�\�;N��H~���p��f�Sɴ����e䎖"Tr-~�U���c�jK�0���Wv"�Of3q#tL��N�f.�����c�d3ܛ�x�-�ٷq���Ʋ��������.��`w��O'���)�W}z��1����g���˼%N<f���ˬ�*'����t!FN,S����%��3��y��h`�A�%�!*0���Rp��b>�U��*\��.g�V� ���Uv_W�vG��P��.�_x��^
B������ܼ�;��s&S�U�Ly�M��X�u�Ԙ&�E�n����"�e�٠j>���ZV�K1������g�Vs}zC|������v�G=�<B��\G�DgC�?6=̊N^��ft��H�����P�ޢIXE�|S�_�jM7��6�������J.����\$摉�i�^Y���N��[Cs�+��j� xeR[w`�$
��Z�
��[��c���1Pe�
9ݯ��B�xxԭxhA�Ҍ��T����e��a*-Rxo�I�*���eJ�İG�)�s���u�����%�[ڸ��`ا�-����q����SY<6�p��! �s}H��o���X�a#v�eG;*���ـ[�A�-�'�,�=YY��p5BJj�]Dk�,P�i�k��Ů[�VJ6���s�/�z�P����#���ܷ���([1͠�L��I�H�	M䝳�pfX�h#�bK�H��+ߣ��ǟ��2��ݲ9hqݽ��=�Y}S��Scb�cqC_e��Y�U'<�\v����'��W���m����W3�*8.����йZ��2�ݛȆ"�L��C��zz��$C�������<Hva�g�1��˪�7;�x��;�G�h��6�Y8��W2�$3���y;�]Ӯ`��Y��? =���#v�K��2��}A��4&�3 ��E&3�)�䬪��^�,��ܰTTw�O�N�R���n�$��ptLQ� �yb�`-��ٳj�����]_���Z۝shtb�Z�5��z�*�xE��v����9����m'���諁�38�0Sj;���?m����>���2�dE�QS�զڠ3�������~tȡw����q�m����N����I��p�pP���1��Q�ϭZ>�F�B��v&gV+D�F	V�Y��Z8B���j�Q�k3'��?%�@l����h$���zƬO/n�d\Y�B�,�r�_�oNU�
�+��x�>��4�t�	����ք�$-g�ڶ�u=�HX���)�S�U�ȿ-TO8�5�@�˃�k���L�ĚY�u�jx�AN��$���5�,W��G�"��S؊YB�kMC��A���>"��z��é&=>����ӫ]��i�����Xp
�9 6�1�dS��ך�|�Z�/��uwt"SL�Ie�������◐8��v�}���+ �Y3a�KK�����4��w��U)��n����(�������ה ��4�']�ዏ2�TP��GVt@W-!sx��(55�¢�(a�t�YTM�{�+!)�^�a=2mYy��EXZ�+y�
�y��'H�������#�\�*����!�⅔i�5��(��ؚ������"@�~�P���z6�CT�I&��6,�����=߰�+4z1i�l�� �73�!=�:
G�1<����G��l�_k8�����2��efL�5Lv!AH�U@n,Y!�<NW�`�L�	�|񷁘I-��8}P�%�&�j��|/��.(e�y�
������Fl[�d�����Na�Y��L��^u?:�N��e��[�1��Y@K�\�/��
�>ݎp��)f��ţ�W�Yv�f���x�*�bv8�Ȫ����	sl���;��	�,��93mW�/�vW�#NŜF�	'ݒ!5Ñ�.�Cs�(�la`8C�g�bU�n;ǫ���|���H��[��z�_�*EeϹ?���6�����k*�"��y��sB��(�m��Q"��9`���u~Ӧ1�Rz�'���k��~�/�,��n��΅���_R�|��gc�o�$����H��Η7�o0מ�f�/giנg�u����6a�i���
?��2,���K�C�����}��ڲ�Г	��ܽ�bR�#��V#1f$v�r��oJ����G�<�76�Y�jDd����c_Fr��P̞��0h�A&�Lh��`ݬ�س�����^M���o���ڿD�� ��㧪0��G����a;���4[u4���+I3|WMj+��f*<F[(�~�P	3F�z�B�q�[%S��ߗ��$ڀP�	զ�I�����Qa��՞�{��I��4}a���A�WtPzxs�zG�V�PMa�!ǳ[H	*�EQ��e%-�A���J�}��:��[O�	U'7}��4Y� �p���F`y<�;���N2�U�*;�lm2�]��L�b���� M���ص�x2[<\�8 4���e��׍/�Ԋ�Q��f��eh1��Za���LM� E�Wi����'�u9���ƴ���a5`�Xi�p\E�N6��
��T�� ���FH8�M�'�j:��s�}h,l��EўN���ޚ��8��pM�_��%-R�!��ԉ��0�r�����+3깷9}OxK*3](x����8�q[�s����MI?@�s7M�HO��^������'��*�!��u)��s�#pq*}�o���y�<�����Rpv~a�]�p��cZMν��W�7�Fe1�{|�˂�+�0U��_m����F�ν��i������f� �8��޸�ⲟ,G�iҙ�g�[_�n���D'Z�nB%ՏVX������	g	��h=����@�n���p�� �p/��M��k�*�֑�R�3,�<���D�}2iѠ,�n�}��4%����g
�t�jJu��� c2���� �&�X��o�g���\�D&/����ȷ����������u.g-+[��T�p~��k��/��\�&񼈎���l��-�zg����lL���{X�^��e\�T����j�}v���1��{o!���VKaJ��Y�Hp�E @���}[4jS
B�Eϒp�E�h�M��p<Z�_��׉���*�(�z(&���'cq��pײ�M`+[f��u�N@�.