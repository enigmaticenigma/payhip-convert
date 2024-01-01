const { SlashCommandBuilder } = require("discord.js");
const { chromium } = require("playwright");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Embed a product from payhip.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The URL of the product.")
        .setRequired(true)
    ),
  run: async ({ interaction, client }) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const targetUrl = interaction.options.getString("url");

      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

      const title = await page.textContent(
        "html.js body#page-product div.content-main-wrapper.js-content-main-wrapper.js-builder-content-main-wrapper div#page-section-product.section-wrapper.js-section-wrapper.js-builder-section-wrapper.js-header-magic-padding-has-been-set div.section-contents-wrapper.js-section-contents-wrapper.js-builder-section-contents-wrapper.standard-padding-left-right div.section-contents.js-section-contents.js-builder-section-contents div.media-and-details-wrapper-outer div.product-details-wrapper div.row div.col-md-12 h1.font-section-product-name"
      );

      const price = await page.textContent(
        "html.js body#page-product div.content-main-wrapper.js-content-main-wrapper.js-builder-content-main-wrapper div#page-section-product.section-wrapper.js-section-wrapper.js-builder-section-wrapper.js-header-magic-padding-has-been-set div.section-contents-wrapper.js-section-contents-wrapper.js-builder-section-contents-wrapper.standard-padding-left-right div.section-contents.js-section-contents.js-builder-section-contents div.media-and-details-wrapper-outer div.product-details-wrapper div.row div.col-md-12 div.product-price span.value.js-product-price-value.custom-style-color-text-heading.font-section-product-price"
      );

      const image = await page.getAttribute(
        "html.js body#page-product div.content-main-wrapper.js-content-main-wrapper.js-builder-content-main-wrapper div#page-section-product.section-wrapper.js-section-wrapper.js-builder-section-wrapper.js-header-magic-padding-has-been-set div.section-contents-wrapper.js-section-contents-wrapper.js-builder-section-contents-wrapper.standard-padding-left-right div.section-contents.js-section-contents.js-builder-section-contents div.media-and-details-wrapper-outer div.media-wrapper-outer div.single-product-image-wrapper.lightbox-trigger-item.js-lightbox-trigger-item img.single-product-image.zoom-trigger-item.js-zoom-trigger-item.global-media-settings",
        "src"
      );

      const description = await page.innerHTML(
        "html.js body#page-product div.content-main-wrapper.js-content-main-wrapper.js-builder-content-main-wrapper div#page-section-product.section-wrapper.js-section-wrapper.js-builder-section-wrapper.js-header-magic-padding-has-been-set div.section-contents-wrapper.js-section-contents-wrapper.js-builder-section-contents-wrapper.standard-padding-left-right div.section-contents.js-section-contents.js-builder-section-contents div.media-and-details-wrapper-outer div.product-details-wrapper div.row div.col-md-12 div.product-description.font-section-product-description.richtext.richtext-quill"
      );

      const formattedDescription = description
        .replace(/<\/p>/g, "\n")
        .replace(/<p>|<br>/g, "")
        .replace(/Features:/g, "> **Features:**")
        .concat("\n> **Price:**")
        .concat(`\n・${price.replace("$", "")} USD`)
        .concat(`\n・${parseFloat(price.replace("$", "")) * 200} ROBUX`);

      await interaction.followUp({
        content: "Embeded",
        ephemeral: true,
      });

      const embed = {
        title: title,
        description: formattedDescription,
        url: targetUrl,
        image: {
          url: image,
        },
      };

      const channel = client.channels.cache.get(interaction.channelId);
      await channel.send({ embeds: [embed] });
      await browser.close();
    } catch (error) {
      console.error("Error occurred:", error);
      await interaction.reply({
        content: "Error occurred while fetching data.",
        ephemeral: true,
      });
    }
  },
  options: {
    userPermissions: ["Administrator"],
  },
};
