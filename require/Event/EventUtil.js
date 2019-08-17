window.EventUtil = {};

EventUtil.triggerEvent = function(element, eventType) {
    if ("createEvent" in document) {
        let evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventType, false, true);
        element.dispatchEvent(evt);
    } else {
        element.fireEvent(eventType);
    }
};