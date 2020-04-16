import Vue from 'vue';
import createJsonldMixin from '../src/createMixin';

const mockInstanceFactory = (mixinOptions) =>
  new Vue({
    mixins: [createJsonldMixin(mixinOptions)],
    data() {
      return {
        breadcrumbs: [
          {
            url: 'https://example.com/',
            name: 'top page',
          },
          {
            url: 'https://example.com/foo/',
            name: 'foo',
          },
        ],
      };
    },
    jsonld() {
      const items = this.breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@id': item.url,
          name: item.text,
        },
      }));
      return {
        '@context': 'http://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items,
      };
    },
  });

describe('without head and without jsonld', () => {
  test('head method does not exist when jsonld is not defined', () => {
    const mock = new Vue({ mixins: [createJsonldMixin()] });
    expect(mock.$options.head).toBeUndefined();
  });
});

describe('without head and with jsonld', () => {
  test('head method returns jsonld metaInfo', () => {
    const mock = mockInstanceFactory();
    expect(mock.$options.head.call(mock)).toEqual({
      __dangerouslyDisableSanitizersByTagID: {
        'nuxt-jsonld-1': ['innerHTML'],
      },
      script: [
        {
          hid: 'nuxt-jsonld-1',
          innerHTML: `
{
  "@context": "http://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@id": "https://example.com/"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@id": "https://example.com/foo/"
      }
    }
  ]
}
`,
          type: 'application/ld+json',
        },
      ],
    });
  });
});

describe('with head and jsonld', () => {
  test('head method returns an empty object when jsonld returns null', () => {
    const mock = mockInstanceFactory();
    mock.$options.jsonld = () => null;
    expect(mock.$options.head.call(mock)).toEqual({});
  });

  describe('customizing indentation', () => {
    test('using tab', () => {
      const mock = mockInstanceFactory({ space: '\t' });
      expect(mock.$options.head.call(mock)).toEqual({
        __dangerouslyDisableSanitizersByTagID: {
          'nuxt-jsonld-3': ['innerHTML'],
        },
        script: [
          {
            hid: 'nuxt-jsonld-3',
            innerHTML: `
{
	"@context": "http://schema.org",
	"@type": "BreadcrumbList",
	"itemListElement": [
		{
			"@type": "ListItem",
			"position": 1,
			"item": {
				"@id": "https://example.com/"
			}
		},
		{
			"@type": "ListItem",
			"position": 2,
			"item": {
				"@id": "https://example.com/foo/"
			}
		}
	]
}
`,
            type: 'application/ld+json',
          },
        ],
      });
    });
    test('no space', () => {
      const mock = mockInstanceFactory({ space: 0 });

      expect(mock.$options.head.call(mock)).toEqual({
        __dangerouslyDisableSanitizersByTagID: {
          'nuxt-jsonld-4': ['innerHTML'],
        },
        script: [
          {
            hid: 'nuxt-jsonld-4',
            innerHTML: `{"@context":"http://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"item":{"@id":"https://example.com/"}},{"@type":"ListItem","position":2,"item":{"@id":"https://example.com/foo/"}}]}`,
            type: 'application/ld+json',
          },
        ],
      });
    });
  });

  test('jsonld with an array creates multiple json-ld scripts', () => {
    const mock = new Vue({
      mixins: [createJsonldMixin()],
      jsonld() {
        return [
          {
            '@context': 'http://schema.org',
            '@type': 'Article',
            name: 'Some name',
          },
          {
            '@context': 'http://schema.org',
            '@type': 'Organization',
            name: 'Some name',
          },
        ];
      },
    });
    const mockCall = mock.$options.head.call(mock);

    expect(mockCall).toEqual({
      __dangerouslyDisableSanitizersByTagID: {
        'nuxt-jsonld-5': ['innerHTML'],
      },
      script: [
        {
          hid: 'nuxt-jsonld-5',
          innerHTML: `
{
  "@context": "http://schema.org",
  "@type": "Article",
  "name": "Some name"
}
`,
          type: 'application/ld+json',
        },
        {
          hid: 'nuxt-jsonld-5',
          innerHTML: `
{
  "@context": "http://schema.org",
  "@type": "Organization",
  "name": "Some name"
}
`,
          type: 'application/ld+json',
        },
      ],
    });
  });
});
