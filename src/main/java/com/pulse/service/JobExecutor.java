package com.pulse.service;

import com.pulse.entity.Job;

import java.nio.file.Path;

public interface JobExecutor {

    Path execute(Job job);
}