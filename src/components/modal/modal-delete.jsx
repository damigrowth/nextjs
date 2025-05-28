export default function DeleteModal({
  id = 'deleteModal',
  title = 'Είστε σίγουροι ότι θέλετε να διαγράψετε;',
  description = 'Θέλετε πραγματικά να διαγράψετε αυτή την εγγραφή; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
  onConfirm,
  isLoading = false,
  disableConfirm = false,
  hideButtons = false,
  hideBody = false,
  children,
}) {
  return (
    <div
      className='modal fade'
      id={id}
      tabIndex={-1}
      aria-labelledby='deleteModalLabel'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content position-relative'>
          {hideBody ? null : (
            <button
              type='button'
              className='btn-close position-absolute no-rotate btn-raw'
              data-bs-dismiss='modal'
              aria-label='Close'
              style={{ top: '10px', right: '10px', zIndex: '9' }}
            />
          )}
          {hideBody ? (
            children
          ) : (
            <div className='modal-body px-4 pt-5'>
              <div className={children ? null : 'pb20'}>
                <h4 className='pb10 text-center text-black'>{title}</h4>
                <p className='text-center'>{description}</p>
              </div>
              <div className='row justify-content-center align-items-center'>
                {children}
              </div>
              {!hideButtons && (
                <div className='d-flex justify-content-center gap-3'>
                  <button
                    type='button'
                    className={
                      disableConfirm
                        ? 'ud-btn bg-danger btn-thm mb25'
                        : 'ud-btn bg-danger text-white mb25 no-rotate btn-raw'
                    }
                    onClick={async () => {
                      if (onConfirm) {
                        await onConfirm();
                      }
                    }}
                    disabled={isLoading || disableConfirm}
                  >
                    {isLoading ? (
                      <>
                        Διαγραφή...
                        <div
                          className='spinner-border spinner-border-sm ms-2'
                          role='status'
                        >
                          <span className='sr-only'></span>
                        </div>
                      </>
                    ) : (
                      <>Ναι</>
                    )}
                  </button>
                  <button
                    type='button'
                    className='ud-btn btn-thm mb25'
                    data-bs-dismiss='modal'
                    aria-label='Close'
                    disabled={isLoading}
                  >
                    Όχι
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
