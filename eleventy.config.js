import footnote_plugin from 'markdown-it-footnote';
import markdownIt from "markdown-it";
import pluginIcons from 'eleventy-plugin-icons';
import { rimrafSync } from 'rimraf';

export default function (eleventyConfig) {
	// Delete the _site folder before the build starts
	eleventyConfig.on('eleventy.before', async () => {
		console.log("Cleaning _site directory...");
		try {
			rimrafSync('_site');
			console.log("✅ Successfully cleaned _site directory");
		} catch (error) {
			console.error("❌ Error cleaning _site directory:", error);
		}
	});

	// Output directory: _site

	// Copy `imgs/` to `_site/imgs/`
	eleventyConfig.addPassthroughCopy("imgs");

	// Copy `css/fonts/` to `_site/css/fonts/`
	// Keeps the same directory structure.
	eleventyConfig.addPassthroughCopy("./fonts");
	eleventyConfig.addPassthroughCopy("./icons");

	// Copy any image file to `_site`, via Glob pattern
	// Keeps the same directory structure.
	eleventyConfig.addPassthroughCopy("**/*.jpg");
	eleventyConfig.addPassthroughCopy("**/*.png");

	let options = {
		html: true,
		breaks: true,
		linkify: true,
	};

	eleventyConfig.setLibrary("md", markdownIt(options));

	// Using https://blog.martin-haehnel.de/blog/2025/02/11/footnotes-in-eleventy/

	eleventyConfig.amendLibrary("md", (mdLib) => {
		mdLib.use(footnote_plugin);
		// Remove brackets only from inline footnote references (.footnote-ref)
		mdLib.renderer.rules.footnote_ref = function(tokens, idx, options, env) {
			const id = Number(tokens[idx].meta.id + 1).toString();
			return `<sup class="footnote-ref"><a href="#fn${id}" id="fnref${id}">${id}</a></sup>`;
		};
		
		// Position footnote number before footnote content
		mdLib.renderer.rules.footnote_open = function(tokens, idx, options, env) {
			const id = Number(tokens[idx].meta.id + 1).toString();
			return `<li id="fn${id}" class="footnote-item"><p><a href="#fnref${id}" class="footnote-backref">${id}</a></p>`;
		};
		
		// Remove the default anchor since we're adding it at the beginning
		mdLib.renderer.rules.footnote_anchor = function() {
			return '';
		};
	});

	// Tell 11ty to watch the CSS file built by Tailwind
	eleventyConfig.addWatchTarget("./_site/bundle.css");
	eleventyConfig.addWatchTarget("./bundle.css");
	
	// Configure the server for better live reload
	eleventyConfig.setServerOptions({
		domDiff: true, // This helps inject CSS changes instantly
		port: 8080, // Consistent port
		showAllHosts: true, // Show all network interfaces
		// Enable live reload (should be default but making explicit)
		liveReload: true,
	});

};

// .eleventy.js
module.exports = function(eleventyConfig) {
  eleventyConfig.addShortcode("analytics", function() {
    // Only output the script if we are building for production
    if (process.env.ELEVENTY_ENV === 'production') {
      return `<script defer data-domain="tomkingdom.github.io" src="https://plausible.io/js/script.js"></script>`;
    }
    return ""; // Return nothing in dev mode
  });
};
