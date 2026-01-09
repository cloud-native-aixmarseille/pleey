const UI_COMPONENT_NAMES = new Set([
  "Button",
  "PrimaryButton",
  "SecondaryButton",
  "SaveButton",
  "CancelButton",
  "DangerButton",
  "BackToButton",
  "Modal",
  "ConfirmModal",
  "Input",
  "PasswordInput",
  "ArcadeCard",
  "ArcadeCardGrid",
  "ArcadeCardStack",
  "ArcadeGlassStack",
  "ArcadeText",
  "ArcadeTitle",
  "ArcadeBanner",
  "ArcadeBadge",
]);

function getJsxElementName(openingElementName) {
  if (!openingElementName) return null;

  if (openingElementName.type === "JSXIdentifier") {
    return openingElementName.name;
  }

  if (openingElementName.type === "JSXMemberExpression") {
    // For cases like <UI.SecondaryButton />
    if (openingElementName.property?.type === "JSXIdentifier") {
      return openingElementName.property.name;
    }
  }

  return null;
}

const noClassNameOnUiComponentsRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow passing className to Design System UI components.",
    },
    schema: [],
    messages: {
      forbidden:
        "Passing `className` to Design System UI components is forbidden. Use wrapper elements or supported props instead.",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const elementName = getJsxElementName(node.name);
        if (!elementName || !UI_COMPONENT_NAMES.has(elementName)) {
          return;
        }

        const hasClassNameProp = node.attributes.some((attr) => {
          if (attr?.type !== "JSXAttribute") return false;
          if (attr.name?.type !== "JSXIdentifier") return false;
          return attr.name.name === "className";
        });

        if (!hasClassNameProp) return;

        context.report({ node, messageId: "forbidden" });
      },
    };
  },
};

export default {
  rules: {
    "no-classname-on-ui-components": noClassNameOnUiComponentsRule,
  },
};
