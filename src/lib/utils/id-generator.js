export function generateApplicationId() {
    const year = new Date().getFullYear();
    const num = Math.floor(100000 + Math.random() * 900000);
    return `TNH-${year}-${num}`;
}
export function generateComplaintId() {
    const year = new Date().getFullYear();
    const num = Math.floor(100000 + Math.random() * 900000);
    return `GRV-${year}-${num}`;
}
export function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
