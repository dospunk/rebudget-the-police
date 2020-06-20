declare interface BudgetData {
    link: string,
    budget: {
        [propName: string]: number
    },
    policeLabel: string,
    excludes: string[],
    desc: string
}

declare interface OriginalBudget {
    departments: string[],
    amounts: number[]
}