const { ramlParseToTemplate } = require('../src/lib/parse-to-template')

describe('vuepress-plugin-raml-loader', () => {
  test('parser should not crash', async () => {
    const filePath = './example/api/ex-section.raml'
    const content = await ramlParseToTemplate(filePath, {
      validate: true,
    })
    expect(content).toContain('# Example RAML API')
  })
})
