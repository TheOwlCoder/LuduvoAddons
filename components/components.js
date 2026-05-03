class Dialog {
    constructor(title, description = "", confirmText = "Confirm") {
        this.title = title, this.description = description, this.confirmText = confirmText;
    }
    content = "";
    onShow = async ()=>{};
    onClose = async ()=>{};
    onConfirm = async ()=>{};
    async show() {
        const dialog = document.createElement("div");
        const dialogCover = document.createElement("div");
        dialogCover.classList = "luduvoDialogCover"
        dialog.setAttribute("data-state", "open")
        dialog.setAttribute("role", "dialog")
        dialog.setAttribute("tabindex", "-1")
        dialog.classList = "luduvoDialog";
        dialog.innerHTML = `<div class="flex flex-col gap-2 text-center sm:text-left">
        <h2 role="title" class="text-lg leading-none font-semibold">${this.title}</h2>
        <p role="description" class="text-muted-foreground text-sm">${this.description}</p>
        </div>
        <div class="space-y-4">
            ${this.content}
        </div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button role="cancelButton" class="luduvoButton" data-slot="dialog-close">${this.confirmText ? "Cancel" : "Okay"}</button>
            ${this.confirmText ? `<button role="confirmButton" class="luduvoButton red" data-slot="dialog-close">${this.confirmText}</button>` : ""}
        </div>
        <button type="button" data-slot="dialog-close" class="close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-x "><path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path></svg><span class="sr-only">Close</span></button>`;
        this.dialog = dialog;
        if (this.confirmText) dialog.querySelector(`[role="confirmButton"]`).addEventListener("click", this.onConfirm);
        dialog.querySelectorAll(`[data-slot="dialog-close"]`).forEach(i => {
            i.onclick = e => {
                dialog.setAttribute("data-state", "closed");
                this.onClose();
                setTimeout(e => {
                    dialogCover.remove();
                }, 220);
            }
        });
        this.onShow();
        document.body.appendChild(dialogCover);
        dialogCover.appendChild(dialog);
    }
};

// const d = new Dialog("title", "description");
// d.content = "test";
// d.show();
