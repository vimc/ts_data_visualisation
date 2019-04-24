const $ = require("jquery");
import * as ko from "knockout";

require("select2");

ko.bindingHandlers.select2 = {

    init: (element: Node, valueAccessor: () => any, allBindings: KnockoutAllBindingsAccessor) => {

        const options = ko.toJS(valueAccessor()) || {};
        setTimeout(() => {

            $(element).select2(options);
            $(element).on("select2:unselecting", (ev: any) => {
                if (ev.params.args.originalEvent) {
                    // When unselecting (in multiple mode)
                    ev.params.args.originalEvent.stopPropagation();
                }
            });

            $(element).on("change", () => {
                const data = $(element).select2("data").map((o: any) => o.id);
                allBindings.get("selectedOptions")(data);
            });
        }, 0);

    },
};
