module.exports = {
    tabWidth: 4,
    singleQuote: true,
    printWidth: 140,
    trailingComma: 'none',
    overrides: [
        {
            files: ['**.html'],
            options: {
                printWidth: 140
            }
        },
        {
            files: ['**.md'],
            options: {
                printWidth: 140,
                proseWrap: 'always'
            }
        }
    ]
};