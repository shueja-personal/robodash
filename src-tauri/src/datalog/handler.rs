use std::path::PathBuf;

use tauri::api::path::document_dir;
use wpilog::log::{CreateDataLogConfig, DataLog, DataLogDaemon, OpenDataLogConfig};

use crate::{check_if_main_thread, error::EnokiError, mushroom_types::MushroomValue, DATALOG};

static RELATIVE_DIRECTORY: &str = "Enoki/Datalogs";

pub fn setup_directory() -> Result<(), ()> {
    if let Some(docu_path) = document_dir() {
        let datalog_dir = docu_path.join(RELATIVE_DIRECTORY);
        if !datalog_dir.exists() {
            let res = std::fs::create_dir_all(datalog_dir);
            if res.is_err() {
                tracing::error!("Failed to create datalog directory: {}", res.unwrap_err());
                return Err(());
            }
        }
        Ok(())
    } else {
        Err(())
    }
}

pub fn create_datalog_daemon() -> DataLogDaemon {
    if let Err(_) = setup_directory() {
        tracing::error!("Failed to setup datalog directory");
        panic!();
    }

    let currunt_time_string =
        chrono::Local::now().format("%Y-%m-%d_%H-%M-%S").to_string() + ".wpilog";

    let relative_path = format!("{}/{}", RELATIVE_DIRECTORY, currunt_time_string);

    let abs_path = document_dir()
        .unwrap()
        .join(relative_path)
        .to_str()
        .unwrap()
        .to_string();

    tracing::info!(
        "Creating datalog at {}",
        PathBuf::from(abs_path.clone()).display()
    );

    let config = CreateDataLogConfig {
        file_path: abs_path.into(),
        metadata: "".into(),
    };

    //if can't create datalog crash
    let datalog = DataLog::create(config.clone()).unwrap();
    datalog.as_daemon()
}

pub fn start_datalog_entry(
    name: &str,
    entry_type: &str,
    metadata: Option<&str>,
) -> Result<(), EnokiError> {
    check_if_main_thread()?;
    DATALOG.with(|datalog| {
        datalog.borrow().borrow_sender().start_entry(
            String::from(name),
            String::from(entry_type),
            metadata.map(String::from),
        )
    })?;
    Ok(())
}

pub fn end_datalog_entry(name: &str) -> Result<(), EnokiError> {
    check_if_main_thread()?;
    DATALOG.with(|datalog| {
        datalog
            .borrow()
            .borrow_sender()
            .finish_entry(String::from(name))
    })?;
    Ok(())
}

pub fn log_datalog_value(name: &str, value: MushroomValue) -> Result<(), EnokiError> {
    check_if_main_thread()?;
    DATALOG.with(|datalog| {
        datalog
            .borrow()
            .borrow_sender()
            .append_to_entry(String::from(name), value.into())
    })?;
    Ok(())
}

pub fn open_datalog(path: PathBuf) -> Result<DataLog, EnokiError> {
    let config = OpenDataLogConfig {
        file_path: path,
        io_type: wpilog::log::IOType::ReadOnly,
    };
    let datalog = DataLog::open(config)?;
    Ok(datalog)
}
