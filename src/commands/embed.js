const { SlashCommandBuilder } = require("discord.js");
const puppeteer = require("puppeteer");

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
  run: async ({ interaction, client, handler }) => {
    await interaction.deferReply({ ephemeral: true });
    const targetUrl = interaction.options.getString("url");
    const channel = client.channels.cache.get(interaction.channelId);

    webhook(targetUrl);

    async function webhook(url) {
      (async () => {
        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox"],
        });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: "domcontentloaded" });

        const product = await page.evaluate(() => {
          const title = document.querySelector(
            "html.js body#page-product div.content-main-wrapper.js-content-main-wrapper.js-builder-content-main-wrapper div#page-section-product.section-wrapper.js-section-wrapper.js-builder-section-wrapper.js-header-magic-padding-has-been-set div.section-contents-wrapper.js-section-contents-wrapper.js-builder-section-contents-wrapper.standard-padding-left-right div.section-contents.js-section-contents.js-builder-section-contents div.media-and-details-wrapper-outer div.product-details-wrapper div.row div.col-md-12 h1.font-section-product-name"
          )?.innerText;
          const price = document.querySelector(
            "html.js body#page-product div.content-main-wrapper.js-content-main-wrapper.js-builder-content-main-wrapper div#page-section-product.section-wrapper.js-section-wrapper.js-builder-section-wrapper.js-header-magic-padding-has-been-set div.section-contents-wrapper.js-section-contents-wrapper.js-builder-section-contents-wrapper.standard-padding-left-right div.section-contents.js-section-contents.js-builder-section-contents div.media-and-details-wrapper-outer div.product-details-wrapper div.row div.col-md-12 div.product-price span.value.js-product-price-value.custom-style-color-text-heading.font-section-product-price"
          )?.innerText;
          const image = document
            .querySelector(
              "html.js body#page-product div.content-main-wrapper.js-content-main-wrapper.js-builder-content-main-wrapper div#page-section-product.section-wrapper.js-section-wrapper.js-builder-section-wrapper.js-header-magic-padding-has-been-set div.section-contents-wrapper.js-section-contents-wrapper.js-builder-section-contents-wrapper.standard-padding-left-right div.section-contents.js-section-contents.js-builder-section-contents div.media-and-details-wrapper-outer div.media-wrapper-outer div.single-product-image-wrapper.lightbox-trigger-item.js-lightbox-trigger-item img.single-product-image.zoom-trigger-item.js-zoom-trigger-item.global-media-settings"
            )
            ?.getAttribute("src");

          const description = document.querySelector(
            "html.js body#page-product div.content-main-wrapper.js-content-main-wrapper.js-builder-content-main-wrapper div#page-section-product.section-wrapper.js-section-wrapper.js-builder-section-wrapper.js-header-magic-padding-has-been-set div.section-contents-wrapper.js-section-contents-wrapper.js-builder-section-contents-wrapper.standard-padding-left-right div.section-contents.js-section-contents.js-builder-section-contents div.media-and-details-wrapper-outer div.product-details-wrapper div.row div.col-md-12 div.product-description.font-section-product-description.richtext.richtext-quill"
          )?.innerHTML;

          return {
            title,
            price,
            description,
            image,
          };
        });

        const title = product.title;
        const price = product.price.replace("$", "");
        const image = product.image;
        const description = product.description
          .replace(/<\/p>/g, "\n")
          .replace(/<p>|<br>/g, "")
          .replace(/Features:/g, "> **Features:**")
          .concat(`\n> **Price:**`)
          .concat(`\n・$${price} USD`)
          .concat(`\n・${price * 200} ROBUX`);

        await browser.close();

        const embed = {
          title: `${title}`,
          description: `${description}`,
          url: url,
          image: {
            url: `${image}`,
          },
        };

        channel.send({ embeds: [embed] });
        interaction.followUp({ content: "Embed sent!", ephemeral: true });
      })();
    }
  },
  options: {
    userPermissions: ["Administrator"],
  },
};
